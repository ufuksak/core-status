import {INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppUpdateTestModule} from "./modules/app.update.test.module";
import {JsonApiExceptionTransformer} from "../../src/products/commons/transformer/jsonapi-exception.transformer";
import {JsonApiTransformer} from "../../src/products/commons/transformer/jsonapi.transformer";
import {useContainer} from "class-validator";
import {getAccessToken} from "../getacctoken";
import {truncateEntity} from "./helpers";
import {StreamEntity} from "../../src/products/entity/stream.entity";
import {StreamTypeEntity} from "../../src/products/entity/stream_type.entity";
import {UpdateEntity} from "../../src/products/entity/update.entity";
import * as cryptosdk from 'globalid-crypto-library/src/index';
import {v4 as uuid} from 'uuid';
import supertest = require("supertest");

jest.setTimeout(60 * 1000);

const token = getAccessToken('keys.manage status.manage');
const authType = {type: "bearer"};
const uuidLength = 36;
const streamType = 'steamTypeToCreateValid';

const validStreamTypeCreateDto = {
  granularity: "single",
  stream_handling: "e2e",
  approximated: true,
  supported_grants: ["range"],
  type: "test213233"
};

const validStreamCreateDto = {
  public_key: "Ut incididuntelit labore",
  encrypted_private_key: "Duis Excepteur culpa repreаddsfdsfhenderit esse",
  stream_type: validStreamTypeCreateDto.type
};

const invalidStreamCreateDto = {
  public_key: "Ut incididuntelit labore",
  encrypted_private_key: "Duis Excepteur culpa repreаddsfdsfhenderit esse",
  stream_type: validStreamTypeCreateDto.type + 'random'
};

const statusUpdateNotExistingStream = {
  status_updates: [
    {
      id: "9ad205e8-fde8-4853-94dc-911ffc35b31e",
      stream_id: "25d3f674-733b-4f3c-9e99-23084d5928ca",
      recorded_at: "2022-04-28T23:05:46.944Z",
      payload: "blablabla"
    }
  ]
}

const statusUpdateTemplate = {
  status_updates: [
    {
      id: "9ad205e8-fde8-4853-94dc-911ffc35b31e",
      stream_id: "",
      recorded_at: "2022-04-28T23:05:46.944Z",
      payload: "blablabla"
    }
  ]
}

describe('StatusModule (e2e)', () => {
  let app: INestApplication;
  let server = null;
  let agent = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppUpdateTestModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppUpdateTestModule), {fallbackOnErrors: true});
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new JsonApiExceptionTransformer());
    app.useGlobalInterceptors(new JsonApiTransformer());
    server = await app.getHttpServer();
    agent = await supertest.agent(server);
    await app.init();
  });

  describe('POST /api/v1/status/streams/types', () => {
    it('should create streamType', async () => {
      const streamTypeOutput = {
        "granularity"     : 'single',
        "stream_handling" : 'lockbox',
        "approximated"    : true,
        "supported_grants": ['range'],
        "type"            : streamType,
        "updated_at"      : expect.any(String),
        "created_at"      : expect.any(String)
      };

      const streamTypeData = {
        granularity     : 'single',
        stream_handling : 'lockbox',
        approximated    : true,
        supported_grants: ['range'],
        type            : streamType,
      };

      // Run your end-to-end test
      const resp = await agent
        .post('/api/v1/status/streams/types')
        .auth(token, authType)
        .set('Accept', 'application/json')
        .send(streamTypeData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(resp?.body?.data?.attributes).toEqual(streamTypeOutput);
    });
  });

  describe('POST /api/v1/status/streams', () => {
    it('should create stream', async () => {
      // Prepare
      const streamData = {
        "stream_type": streamType,
        "public_key": "Ut incididuntelit labore",
        "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
      };

      // Act
      const resp = await agent
        .post('/api/v1/status/streams')
        .set('Accept', 'text/plain')
        .auth(token, authType)
        .send(streamData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(201);

      // Check
      expect(resp?.body?.data?.id).toHaveLength(uuidLength);
    });
  });


  describe('PUT /api/v1/status/grants', () => {
    it('should return the grantId', async () => {
      const accessToken = getAccessToken();

      const streamType = uuid();
      const streamTypeData = {
        granularity     : 'single',
        stream_handling : 'lockbox',
        approximated    : true,
        supported_grants: ['range'],
        type            : streamType,
      };
      const streamData = {
        "streamType": streamType,
        "publicKey": "Ut incididuntelit labore",
        "encryptedPrivateKey": "Duis Excepteur culpa reprehenderit esse",
      };

      // Run your end-to-end test
      await supertest.agent(app.getHttpServer())
        .post('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(accessToken, {type: "bearer"})
        .send(streamTypeData)
        .expect('Content-Type', /json/)
        .expect(201);

        // Run your end-to-end test
        const { text: stream_id } = await supertest.agent(app.getHttpServer())
            .put('/api/v1/status/streams')
            .set('Accept', 'text/plain')
            .auth(accessToken, {type: "bearer"})
            .send(streamData)
            .expect('Content-Type', /text\/html/)
            .expect(200);

        const grantData = {
          "stream_id": stream_id,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        };

        // Run your end-to-end test
        const { text } = await supertest.agent(app.getHttpServer())
            .put('/api/v1/status/grants')
            .set('Accept', 'text/plain')
            .auth(accessToken, {type: "bearer"})
            .send(grantData)
            .expect('Content-Type', /text\/html/)
            .expect(200);

        expect(typeof text).toBe('string');
        expect(text).toHaveLength(36);
      })
    })

  describe('GET /api/v1/status/streams/types', () => {
    it('should get all streamTypes', async () => {
      const streamTypeOutput = {
        // "id"            : expect.any(String),
        "granularity"     : 'single',
        "stream_handling" : 'lockbox',
        "approximated"    : true,
        "supported_grants": ['range'],
        "type"            : streamType,
        "updated_at"      : expect.any(String),
        "created_at"      : expect.any(String)
      };

      // Run your end-to-end test
      const resp = await agent
        .get('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(token, authType)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(resp?.body?.data?.[0]['attributes'])
        .toEqual(streamTypeOutput)
    });
  });

  describe('globalid-crypto-library e2e', () => {
    it('prepare', async () => {
      await Promise.all(
        [StreamEntity, StreamTypeEntity, UpdateEntity].map(async el => {
          await truncateEntity(el);
        }))
    });

    it('e2e stream create and upload update', async () => {
      const masterKeys = cryptosdk.PRE.generateKeyPair();

      const e2eStreamType = Object.assign({}, validStreamTypeCreateDto);
      await agent.post('/api/v1/status/streams/types')
        .auth(token, authType)
        .send(e2eStreamType)
        .expect(201);

      const e2eStream = Object.assign({}, validStreamCreateDto);


      e2eStream.encrypted_private_key = cryptosdk.PRE.encrypt(
        masterKeys.public_key, masterKeys.private_key
      ).cipher;

      e2eStream.public_key = masterKeys.public_key;

      const respStream = await agent.post('/api/v1/status/streams')
        .auth(token, authType)
        .send(e2eStream)
        .expect(201);

      const payload = 'some payload';
      const validUpdate = Object.assign({}, statusUpdateTemplate);
      validUpdate.status_updates[0].stream_id = respStream?.body?.data?.id;
      validUpdate.status_updates[0].payload = cryptosdk.PRE.encrypt(masterKeys.public_key,payload).cipher;
      const respStatus = await agent.post('/api/v1/status/upload')
        .auth(token, authType)
        .send(validUpdate)
        .expect(201);

      expect(respStatus?.body?.data?.attributes.status_updates?.[0]['id']).toEqual(validUpdate.status_updates[0].id);
    });
  })

  afterAll(async () => {
    await app.close();
  });
})
