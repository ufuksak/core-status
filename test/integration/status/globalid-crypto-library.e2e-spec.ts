import {INestApplication} from "@nestjs/common";
import {getAccessToken} from "../../getacctoken";
import {truncateEntity} from "../helpers";
import {StreamEntity} from "../../../src/products/entity/stream.entity";
import {StreamTypeEntity} from "../../../src/products/entity/stream_type.entity";
import {UpdateEntity} from "../../../src/products/entity/update.entity";
import * as cryptosdk from '@articice/globalid-crypto-library-pre';
import {v4 as uuid} from 'uuid';
import { AlgorithmType, Purpose } from "../../../src/products/dto/keystore.byme.model";
import { decryptPayload, encryptPayload } from "../../../src/products/util/pre";
import setup from "./utils/setup";
import before from "./utils/before";

import {
  allMightToken,
  allScopes,
  authType,
  statusUpdateTemplate,
  validStreamCreateDto,
  validStreamTypeCreateDto
} from "./utils/mocks";

jest.setTimeout(3 * 60 * 1000);

describe('StatusModule (e2e)', () => {
  let app: INestApplication;
  let agent = null;

  beforeAll(async () => {
    const setting = await setup()

    app = setting.app;
    agent = setting.agent;
  });

  beforeEach(before);

  describe('globalid-crypto-library e2e', () => {
    it('prepare', async () => {
      await Promise.all(
        [StreamEntity, StreamTypeEntity, UpdateEntity].map(async el => {
          await truncateEntity(el);
        }))
    });

    async function createStream() {
      const masterKeys = cryptosdk.PRE.generateKeyPair();

      const e2eStreamType = Object.assign({}, validStreamTypeCreateDto);
      await agent.post('/api/v1/status/streams/types')
          .auth(allMightToken, authType)
          .send(e2eStreamType)
          .expect(201);

      const e2eStream = Object.assign({}, validStreamCreateDto);


      e2eStream.encrypted_private_key = cryptosdk.PRE.encrypt(
        masterKeys.public_key, masterKeys.private_key
      ).cipher;

      e2eStream.public_key = masterKeys.public_key;

      const respStream = await agent.post('/api/v1/status/streams')
          .auth(allMightToken, authType)
          .send(e2eStream)
          .expect(201);
      return {masterKeys, respStream};
    }

    async function uploadUpdate(respStream: any, masterKeys: any) {
      const createdStreamId = respStream?.body?.data?.id;
      const payload = 'some payload';
      const validUpdate = Object.assign({}, statusUpdateTemplate);
      validUpdate.status_updates[0].stream_id = createdStreamId;
      validUpdate.status_updates[0].payload = cryptosdk.PRE.encrypt(masterKeys.public_key, payload).cipher;
      await agent.post('/api/v1/status')
          .auth(allMightToken, authType)
          .send(validUpdate)
          .expect(201);

      return validUpdate;
    }

    it('e2e stream create and upload update', async () => {
      const {masterKeys, respStream} = await createStream();

      await uploadUpdate(respStream, masterKeys);
    });

    it('e2e grant create', async () => {
      const userId = uuid();
      const token = getAccessToken(allScopes, userId);

      const keys = cryptosdk.PRE.generateKeyPair();

      const e2eStreamType = Object.assign({}, validStreamTypeCreateDto);

      await agent.post('/api/v1/status/streams/types')
        .auth(token, authType)
        .send(e2eStreamType)
        .expect(201);

      const e2eStream = Object.assign({}, validStreamCreateDto);

      e2eStream.encrypted_private_key = cryptosdk.PRE.encrypt(
        keys.public_key, keys.private_key
      ).cipher;

      e2eStream.public_key = keys.public_key;

      const respStream = await agent.post('/api/v1/status/streams')
        .auth(token, authType)
        .send(e2eStream)
        .expect(201);

      const createdStreamId = respStream?.body?.data?.id;
      const gid_uuid = respStream?.body?.data?.owner_id;

      const restKeys = await agent
        .post(`/api/v1/identity/keys/search`)
        .auth(token, authType)
        .send({ gid_uuid, purpose: Purpose.status_stream })
        .expect('Content-Type', /json/)
        .expect(201);

      const keyPublic_key = restKeys?.body?.data?.key_pairs[0].public_key;

      const reEncryptionKey = cryptosdk.PRE.generateReEncryptionKey(
        keys.private_key,
        keyPublic_key
      );

      const grantData = {
        "stream_id": createdStreamId,
        "recipient_id": uuid(),
        "properties": {
          e2eKey: '',
          reEncryptionKey
        },
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": "range",
      };

      // Run your end-to-end test
      const postResp = await agent
        .post('/api/v1/status/grants')
        .set('Accept', 'text/plain')
        .auth(token, authType)
        .send(grantData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(201);

      const grantOutput = {
        ...grantData,
        "owner_id": userId,
        "updated_at": expect.any(String),
        "created_at":expect.any(String),
        "id": expect.any(String)
      };

      // Check
      expect(postResp?.body?.data).toEqual(grantOutput);
    });

    it('e2e stream create and get stream by range', async () => {
      const userAid = uuid();
      const userBid = uuid();

      const userAToken = getAccessToken(allScopes, userAid);
      const userBToken = getAccessToken(allScopes, userBid);

      const userAKeysFromInternalStorage = cryptosdk.PRE.generateKeyPair();
      const userBKeysFromInternalStorage = cryptosdk.PRE.generateKeyPair();

      const userBKeyPair = {
        public_key: userBKeysFromInternalStorage.public_key,
        encrypted_private_key: cryptosdk.PRE.encrypt(
          userBKeysFromInternalStorage.public_key, userBKeysFromInternalStorage.private_key
        ).cipher,
        purpose: Purpose.status_sharing,
        algorithm_type: AlgorithmType.ec
      };

      await agent
        .post('/api/v1/identity/me/keys')
        .set('Accept', 'application/json')
        .auth(userBToken, authType)
        .send(userBKeyPair)
        .expect('Content-Type', /json/)
        .expect(201);

      const e2eStreamType = {
        granularity: "single",
        stream_handling: "e2e",
        approximated: true,
        supported_grants: ["range"],
        type: "test213233"
      };

      await agent.post('/api/v1/status/streams/types')
        .auth(userAToken, authType)
        .send(e2eStreamType)
        .expect(201);

      const e2eStream ={
        public_key: userAKeysFromInternalStorage.public_key,
        encrypted_private_key: cryptosdk.PRE.encrypt(
          userAKeysFromInternalStorage.public_key, userAKeysFromInternalStorage.private_key
        ).cipher,
        stream_type: validStreamTypeCreateDto.type
      };

      const respStream = await agent.post('/api/v1/status/streams')
        .auth(userAToken, authType)
        .send(e2eStream)
        .expect(201);

      const createdStreamId = respStream?.body?.data?.id;

      const originalPayload = 'some payload';

      const statusUpdate = {
        id: uuid(),
        stream_id: createdStreamId,
        recorded_at: "2022-04-28T23:05:46.944Z",
        payload: encryptPayload(originalPayload, userAKeysFromInternalStorage.public_key),
        marker: {
          started: true,
          frequency: '15m',
          stopped: null
        }
      }

      const saveStatusUpdates = {
        status_updates: [
          statusUpdate
        ]
      };

      await agent.post('/api/v1/status')
          .auth(userAToken, authType)
          .send(saveStatusUpdates)
          .expect(201);

      const restKeys = await agent
        .post(`/api/v1/identity/keys/search`)
        .auth(userAToken, authType)
        .send({ gid_uuid: userBid, purpose: Purpose.status_sharing })
        .expect('Content-Type', /json/)
        .expect(201);

      const keyPublic_key = restKeys?.body?.data?.key_pairs[0].public_key;

      const reEncryptionKey = cryptosdk.PRE.generateReEncryptionKey(
        userAKeysFromInternalStorage.private_key,
        keyPublic_key
      );

      const fromDate = "2022-04-25T00:00:00.000Z";
      const toDate = "2022-04-30T00:00:00.000Z";

      const grantData = {
        "stream_id": createdStreamId,
        "recipient_id": userBid,
        "properties": {
          e2eKey: 'pre',
          reEncryptionKey
        },
        fromDate,
        toDate,
        "type": "range",
      };

      // Run your end-to-end test
      await agent
        .post('/api/v1/status/grants')
        .set('Accept', 'text/plain')
        .auth(userAToken, authType)
        .send(grantData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(201);

      // Act
      const { body } = await agent
        .post(`/api/v1/status/data/${createdStreamId}`)
        .auth(userBToken, authType)
        .send({ fromDate, toDate })
        .expect(201);

      const { data: statusUpdates } = body;

      const decryptedMessage = decryptPayload(statusUpdates[0].payload, userBKeysFromInternalStorage.private_key);

      const statusUpdateOutput = {
        stream_id: statusUpdate.stream_id,
        recorded_at: statusUpdate.recorded_at,
        marker: {
          ...statusUpdate.marker,
          deleted: false,
        },
        payload: expect.any(String),
        uploaded_at: expect.any(String),
        id: expect.any(String)
      };

      // Check
      expect(statusUpdates[0]).toEqual(statusUpdateOutput);
      expect(decryptedMessage).toEqual(originalPayload);
    });
  })

  afterAll(async () => {
    await app.close();
  });
})
