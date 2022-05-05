import {Test, TestingModule} from "@nestjs/testing";
import {INestApplication} from "@nestjs/common";
import {AppUploadsTestModule} from "./modules/app.uploads.test.module";
import * as fs from "fs/promises"
import {S3ConfigProvider} from "../../src/products/config/s3.config.provider";
import {MessageHandler} from "@globalid/nest-amqp";
import waitForExpect from "wait-for-expect";
import {getAccessToken} from "../getacctoken";
import supertest = require("supertest");
import {UploadDto} from "../../src/products/dto/upload.model";
import {PayloadType} from "../../src/products/entity/upload.entity";

jest.setTimeout(3 * 60 * 1000);

class Handlers {
    collectedMessages: [] = []

    getCollectedMessages(): string[] {
        return [...this.collectedMessages]
    }

    clearCollectedMessages(): void {
        this.collectedMessages = [];
    }

    @MessageHandler({})
    async updateAdd(evt: UploadDto): Promise<void> {
        this.collectedMessages.push(evt as never)
    }
}

describe('Upload', () => {
    let app: INestApplication;
    let lockboxPostedId = null;
    let contentPostedId = null;
    let littlePayload = null;
    let little1Payload = null;
    let normalPayload = null;
    let server = null;
    let agent = null;
    let handlers: Handlers = null;

    const token = getAccessToken();

    const littlePayloadPath = './test/integration/sources/little.txt';
    const little1PayloadPath = './test/integration/sources/little.txt';
    const normalPayloadPath = './test/integration/sources/normal.png';

    beforeAll(async () => {
        const moduleFixture: TestingModule =
          await Test.createTestingModule({
              imports: [AppUploadsTestModule],
              providers: [Handlers]
          }).compile();

        app = await moduleFixture.createNestApplication();
        await app.init();

        littlePayload = String(await fs.readFile(littlePayloadPath));
        little1Payload = String(await fs.readFile(little1PayloadPath));
        normalPayload = String(await fs.readFile(normalPayloadPath));
        server = await app.getHttpServer();
        handlers = app.get<Handlers>(Handlers);
        agent = await supertest.agent(server);
        await new S3ConfigProvider().createBucket();
    });

    describe('POST /api/v1/uploads/users/file', () => {
        it('lockbox posted', async () => {
            const response = await agent.post(`/api/v1/uploads/users/file?type=lockbox`)
              .set('Authorization', `Bearer ${token}`)
              .attach('file', normalPayloadPath)
              .expect(201);

            lockboxPostedId = response.body.id

            await waitForExpect(() => {
                expect(handlers.getCollectedMessages()[0]).toEqual(response.body)
            })

            handlers.clearCollectedMessages();
        });

        it('content posted', async () => {
            const response = await agent
              .post(`/api/v1/uploads/users/file?type=content`)
              .set('Authorization', `Bearer ${token}`)
              .attach('file', littlePayloadPath)
              .expect('Content-Type', /json/)
              .expect(201);

            contentPostedId = response.body.id;

            await waitForExpect(() => {
                expect(handlers.getCollectedMessages()[0]).toEqual(response.body)
            })

            handlers.clearCollectedMessages();
        });

        it('content rejected by size', async () => {
            await agent
              .post(`/api/v1/uploads/users/file?type=content`)
              .set('Authorization', `Bearer ${token}`)
              .attach('file', normalPayloadPath)
              .expect(400);
        });
    });

    describe('PUT /api/v1/uploads/users/file/:file', () => {
        const updateFile = async (
          fileId: string, type: PayloadType, payloadPath: string, payload: string
        ) => {
            const getUrl = `/api/v1/uploads/users/file/${fileId}`;
            const postUrl = `${getUrl}?type=${type}`;

            await agent.put(postUrl)
              .attach('file', payloadPath)
              .set('Authorization', `Bearer ${token}`)
              .expect(200);

            const {body} = await agent
              .get(getUrl)
              .set('Authorization', `Bearer ${token}`)
              .expect(200);

            expect(String(body))
              .toEqual(payload);
        }

        it('lockbox updated to lockbox', async () => {
            await updateFile(
              lockboxPostedId, PayloadType.lockbox, normalPayloadPath, normalPayload
            );
        });

        it('lockbox updated to content', async () => {
            await updateFile(
              lockboxPostedId, PayloadType.content, littlePayloadPath, littlePayload
            );
        });

        it('content updated to content', async () => {
            await updateFile(
              lockboxPostedId, PayloadType.content, little1PayloadPath, little1Payload
            );
        });

        it('content updated to lockbox', async () => {
            await updateFile(
              lockboxPostedId, PayloadType.lockbox, normalPayloadPath, normalPayload
            );
        });
    });

    describe('DELETE /api/v1/uploads/users/file/:file', () => {
        it('delete file', async () => {
            const deleteUrl = `/api/v1/uploads/users/file`;
            const getUrl = `${deleteUrl}/${contentPostedId}`;

            await agent.get(getUrl)
              .set('Authorization', `Bearer ${token}`)
              .expect(200);

            await agent.delete(deleteUrl)
              .send({
                  ids: [contentPostedId]
              })
              .set('Authorization', `Bearer ${token}`)
              .expect(200);

            await agent.get(getUrl)
              .set('Authorization', `Bearer ${token}`)
              .expect(404);
        });
    });

    afterAll(async () => {
        await agent.close
        await app.close();
    });
})