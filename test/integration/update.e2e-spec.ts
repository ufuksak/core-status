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
import supertest = require("supertest");
import * as cryptosdk from 'globalid-crypto-library/src/index';

jest.setTimeout(60 * 1000);

const token = getAccessToken('keys.manage status.manage');
const authType = {type: "bearer"};

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
  let validStreamId = null;

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

  describe('PUT /api/v1/statuses/streams/types', () => {
    it('should create type', async () => {
      await agent.put('/api/v1/statuses/streams/types')
        .auth(token, authType)
        .send(validStreamTypeCreateDto)
        .expect(200);
    })

    it('should not create type', async () => {
      await agent.put('/api/v1/statuses/streams/types')
        .auth(token, authType)
        .send(validStreamTypeCreateDto)
        .expect(400);
    })
  });

  describe('PUT /api/v1/statuses/streams', () => {
    it('should not create stream', async () => {
      await agent.put('/api/v1/statuses/streams')
        .auth(token, authType)
        .send(invalidStreamCreateDto)
        .expect(400);
    });

    it('should create stream', async () => {
      await agent.put('/api/v1/statuses/streams')
        .auth(token, authType)
        .send(validStreamCreateDto)
        .expect(200)
        .then(el => validStreamId = el?.body?.data?.id);
    });
  });

  describe('PUT /api/v1/statuses', () => {
    it('should not put update', async () => {
      await agent.put('/api/v1/statuses')
        .auth(token, authType)
        .send(statusUpdateNotExistingStream)
        .expect(400);
    });

    it('should put update', async () => {
      const validUpdate = Object.assign({}, statusUpdateTemplate);
      validUpdate.status_updates[0].stream_id = validStreamId;

      await agent.put('/api/v1/statuses')
        .auth(token, authType)
        .send(validUpdate)
        .expect(200);
    });
  });

  describe('globalid-crypto-library e2e', () => {
    it('prepare', async () => {
      await Promise.all(
        [StreamEntity, StreamTypeEntity, UpdateEntity].map(async el => {
          await truncateEntity(el);
        }))
    });

    it('e2e stream', async () => {
      const masterKeys = cryptosdk.PRE.generateKeyPair();

      const e2eStreamType = Object.assign({}, validStreamTypeCreateDto);
      await agent.put('/api/v1/statuses/streams/types')
        .auth(token, authType)
        .send(e2eStreamType)
        .expect(200);

      const e2eStream = Object.assign({}, validStreamCreateDto);


      e2eStream.encrypted_private_key = cryptosdk.PRE.encrypt(
        masterKeys.public_key, masterKeys.private_key
      ).cipher;

      e2eStream.public_key = masterKeys.public_key;

      const {body} = await agent.put('/api/v1/statuses/streams')
        .auth(token, authType)
        .send(e2eStream)
        .expect(200);

      const payload = 'some payload';
      const validUpdate = Object.assign({}, statusUpdateTemplate);
      validUpdate.status_updates[0].stream_id = body?.data?.id;
      validUpdate.status_updates[0].payload = cryptosdk.PRE.encrypt(masterKeys.public_key,payload).cipher;
      await agent.put('/api/v1/statuses')
        .auth(token, authType)
        .send(validUpdate)
        .expect(200);
    });
  })

  afterAll(async () => {
    await app.close();
  });
})