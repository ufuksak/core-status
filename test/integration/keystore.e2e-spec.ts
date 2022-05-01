import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import * as supertest from "supertest";
import {AppUsersTestModule} from "./app.users.test.module";
import {MessageHandler} from "@globalid/nest-amqp";
import {UserDto} from "../../src/products/dto/user.model";
import {getAccessToken} from "../getacctoken";

jest.setTimeout(60 * 1000);

class Handlers {
    collectedMessages: [] = [];

    @MessageHandler({})
    async updateAdd(evt: UserDto): Promise<void> {
        this.collectedMessages.push(evt as never);
    }
}

describe('KeystoreController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.NODE_ENV = 'debugkeystore';
        process.env.SDK_CUSTOM_API_URL = 'http://localhost';
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppUsersTestModule],
            providers: [Handlers]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        jest.resetModules() // Most important - it clears the cache
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/identity/me/keys', () => {
        it('should return the keystore', async () => {

            const output = {
                "uuid": expect.any(String),
                "algorithm_type": "ec",
                "client_id": null,
                "gid_uuid": expect.any(String),
                "status": "confirmed",
                "public_key": "Ut incididuntelit labore",
                "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
                "version": expect.any(Number),
                "tag": "status-stream",
                "consent_id": null,
                "purpose": "status-stream",
                "external": false,
                "latest": true,
                "updated_at": expect.any(String),
                "created_at": expect.any(String),
                "device_id": expect.any(String)
            };

            const inputData = {
                "public_key": "Ut incididuntelit labore",
                "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
                "purpose": "status-stream",
                "algorithm_type": "ec"
            };

            const accessToken = getAccessToken();

            // Run your end-to-end test
            const {body} = await supertest.agent(app.getHttpServer())
                .post('/api/v1/identity/me/keys')
                .set('Accept', 'application/json')
                .auth(accessToken, {type: "bearer"})
                .send(inputData)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(body).toEqual({...output});
        });
    });
});
