import {Test, TestingModule} from "@nestjs/testing";
import {INestApplication} from "@nestjs/common";
import {AppUploadTestModule} from "./app.upload.test.module";
import * as fs from "fs/promises"
import {PayloadType} from "../../src/products/entity/file.entity";
import supertest = require("supertest");
import {S3ConfigProvider} from "../../src/products/config/s3.config.provider";

let app: INestApplication;
let testUserId: string = null;

jest.setTimeout(3 * 60 * 1000);

const userPostBody = {
    "username": "myname",
    "pin": "pin",
    "name": "myname1",
    "surname": "myname2",
    "address_line_1": "test address1",
    "address_line_2": "address2",
    "city": "Laos",
    "state_province": "-",
    "postal_code": "36100",
    "country": "Laos",
    "phone_num": "00905557032475",
    "mobile_num": "00905555635175",
    "fax_num": "-",
    "gpsList": [
        {
            "device_id": "1",
            "speed": 50,
            "direction": 50
        }
    ],
    "actionList": [
        {
            "name": "userSave",
            "description": "user save"
        }
    ]
};

describe('Upload', () => {
    let lockboxPostedId = null;
    let contentPostedId = null;
    let littlePayload = null;
    let little1Payload = null;
    let normalPayload = null;
    let server = null;
    let agent = null;

    const littlePayloadPath = './test/integration/sources/little.txt';
    const little1PayloadPath = './test/integration/sources/little.txt';
    const normalPayloadPath = './test/integration/sources/normal.png';

    beforeAll(async () => {
        const moduleFixture: TestingModule =
            await Test.createTestingModule({
                imports: [AppUploadTestModule],
            }).compile();

        app = await moduleFixture.createNestApplication();
        await app.init();

        littlePayload = String(await fs.readFile(littlePayloadPath));
        little1Payload = String(await fs.readFile(little1PayloadPath));
        normalPayload = String(await fs.readFile(normalPayloadPath));
        server = await app.getHttpServer();
        agent = await supertest.agent(server);
        await new S3ConfigProvider().createBucket();
    });

    describe('POST /api/v1/users', () => {
        it('user added', async () => {
            await agent
                .post('/api/v1/users')
                .send(userPostBody)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(201)
                .then(res => testUserId = res.body.id);
        });
    });

    describe('POST /api/v1/upload/users/:id/file/:file', () => {
        it('lockbox posted', async () => {
            await agent.post(`/api/v1/upload/users/${testUserId}/file?type=lockbox`)
                .attach('file', normalPayloadPath)
                .expect(201)
                .then(res => {
                    lockboxPostedId = res.body.id
                });

        });

        it('content posted', async () => {
            await agent
                .post(`/api/v1/upload/users/${testUserId}/file?type=content`)
                .attach('file', littlePayloadPath)
                .expect('Content-Type', /json/)
                .expect(201)
                .then(res => contentPostedId = res.body.id);
        });

        it('content rejected by size', async () => {
            await agent
                .post(`/api/v1/upload/users/${testUserId}/file?type=content`)
                .attach('file', normalPayloadPath)
                .expect(400);
        });
    });

    describe('PUT /api/v1/upload/users/:id/file/:file', () => {
        const updateFile = async (
            userId: string, fileId: string, type: PayloadType, payloadPath: string, payload: string
        ) => {
            const getUrl = `/api/v1/upload/users/${userId}/file/${fileId}`;
            const postUrl = `${getUrl}?type=${type}`;

            await agent.put(postUrl)
                .attach('file', payloadPath)
                .expect(200);

            const { body } = await agent
                .get(getUrl)
                .expect(200);

            expect(String(body))
                .toEqual(payload);
        }

        it('lockbox updated to lockbox', async () => {
            await updateFile(
                testUserId, lockboxPostedId, PayloadType.lockbox, normalPayloadPath, normalPayload
            );
        });

        it('lockbox updated to content', async () => {
            await updateFile(
                testUserId, lockboxPostedId, PayloadType.content, littlePayloadPath, littlePayload
            );
        });

        it('content updated to content', async () => {
            await updateFile(
                testUserId, lockboxPostedId, PayloadType.content, little1PayloadPath, little1Payload
            );
        });

        it('content updated to lockbox', async () => {
            await updateFile(
                testUserId, lockboxPostedId, PayloadType.lockbox, normalPayloadPath, normalPayload
            );
        });
    });

    describe('DELETE /api/v1/upload/users/:id/file/:file', () => {
       it('delete file', async () => {
           const deleteUrl = `/api/v1/upload/users/${testUserId}/file`;
           const getUrl = `${deleteUrl}/${contentPostedId}`;

           await agent.get(getUrl)
               .expect(200);

           await agent.delete(deleteUrl)
               .send({
                   ids: [contentPostedId]
               })
               .expect(200);

           await agent.get(getUrl)
               .expect(404);
       });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('delete file after author gone', async () => {
            const deleteUrl = `/api/v1/users/${testUserId}`;
            const getUrl = `/api/v1/upload/users/${testUserId}/file/${lockboxPostedId}`;

            await agent.get(getUrl)
                .expect(200);

            await agent.delete(deleteUrl)
                .expect(200);

            await agent.get(getUrl)
                .expect(404);
        });
    });

    afterAll(async () => {
        await agent.close
        await app.close();
    });
})
