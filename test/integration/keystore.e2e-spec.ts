import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import * as supertest from "supertest";
import {getAccessToken} from "../getacctoken";
import {config} from 'dotenv'
import {KeystoreModule} from "../../src/products/modules/keystore.module";
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../src/products/config/config";
import {AmqpModule} from "@globalid/nest-amqp";
import {ConfigModule} from "@nestjs/config/dist";


config()
jest.setTimeout(60 * 1000);

describe('KeystoreController (e2e)', () => {
  let app: INestApplication;
  const keystoreUrl = `localhost:${process.env.KEYSTORE_PORT}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'debugkeystore';
    process.env.SDK_CUSTOM_API_URL = 'http://localhost';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [KeystoreModule,
        AmqpModule.forConfig({
          urlOrOpts: RABBIT_URI,
          defaultValidationOptions: {classTransform: {enableImplicitConversion: true}, validate: true},
        }),
        ConfigModule.forRoot({
          validationSchema: CONFIG_VALIDATION_SCHEMA,
          validationOptions: {
            allowUnknown: true,
            abortEarly: true,
          },
          isGlobal: true
        })
      ]
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
        "algorithm_type": "rsa",
        "client_id": null,
        "gid_uuid": expect.any(String),
        "status": "confirmed",
        "public_key": "Ut incididuntelit labore",
        "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
        "version": expect.any(Number),
        "tag": "encryption",
        "consent_id": null,
        "purpose": "encryption",
        "external": false,
        "latest": true,
        "updated_at": expect.any(String),
        "created_at": expect.any(String),
        "device_id": expect.any(String)
      };

      const inputData = {
        "public_key": "Ut incididuntelit labore",
        "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
        "purpose": "encryption",
        "algorithm_type": "rsa"
      };

      const scope = 'public keys.manage';
      const accessToken = getAccessToken(scope);

      // Run your end-to-end test
      const {body} = await supertest.agent(app.getHttpServer())
        .post(`/api/v1/identity/me/keys`)
        .set('Accept', 'application/json')
        .auth(accessToken, {type: "bearer"})
        .send(inputData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({...output});
    });
  });
});
