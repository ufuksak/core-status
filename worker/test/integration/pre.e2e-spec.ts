import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import * as supertest from "supertest";
import {AppTestModule} from "./modules/worker.module";
import {getAccessToken} from "../../../test/getacctoken";
import {Scopes} from "../../../src/products/util/util";
import {StreamTypeDto} from "../../../src/products/dto/stream_type.model";
import {CreateStreamRequestBody} from "../../../src/products/dto/stream.model";
import {GrantDto, GrantType} from "../../../src/products/dto/grant.model";
import * as cryptosdk from "../../../globalid-crypto-library/src";
import {v4 as uuid} from 'uuid';
import {LockboxWithContent} from "../../worker/dist/pre";
import waitForExpect from "wait-for-expect";
import {CHANNEL_PREFIX} from "../../src/services/pubnub.service";
import PubNub = require("pubnub");
import {StatusUpdateDto} from "../../../src/products/dto/status.model";

const dotenv = require('dotenv');
dotenv.config();
const util = cryptosdk.PRE.util;

const recipient_id = "95abffad-9c5b-40da-ada5-a156418b64ef";
const allScopes = Object.values(Scopes).join(' ');
let recievedMessage = null;

const pubnub = new PubNub({
  publishKey: process.env.WORKER_PUBLISH_KEY,
  subscribeKey: process.env.WORKER_SUBSCRIBE_KEY,
  uuid: recipient_id
});

pubnub.addListener({
  message: function (event) {
    recievedMessage = event?.message;
  }
});


jest.setTimeout(60 * 1000);

interface prepareEntityOptions  {
  agent: supertest.SuperAgentTest
  accessToken: string
  httpCode?: number
}

const prepareStreamType = async (
  dto: StreamTypeDto, options: prepareEntityOptions
) => agentPostAndExpect(`/api/v1/status/streams/types`, dto, options);

const prepareStream = async (
  dto: CreateStreamRequestBody, options: prepareEntityOptions
) => agentPostAndExpect(`/api/v1/status/streams`, dto, options);

const prepareGrant = async (
  dto: GrantDto, options: prepareEntityOptions
) => agentPostAndExpect(`/api/v1/status/grants`, dto, options);

const prepareStatus = async (
  dto: StatusUpdateDto, options: prepareEntityOptions
) => agentPostAndExpect(`/api/v1/status`, dto, options);

const agentPostAndExpect = async (
  suffix: string, dto: any, {agent, accessToken, httpCode}: prepareEntityOptions
) => agent.post(suffix)
  .set('Accept', 'application/json')
  .auth(accessToken, {type: "bearer"})
  .send(dto)
  .expect('Content-Type', /json/)
  .expect(httpCode || 201);

const waitUntilSubscribed = async (grantChannel: string) => {
  while(true) {
    await new Promise(resolve => setTimeout(() => resolve({}), 500));
    const response: PubNub.HereNowResponse = await pubnub.hereNow({
      channels : [grantChannel],
      includeUUIDs: true,
      includeState: false
    });

    if(response?.channels[grantChannel].occupants.find(el => el.uuid === recipient_id)) {
      break;
    }
  }
}

const createDtos = () => {
  const accessToken = getAccessToken(allScopes);
  const type = uuid();
  const streamTypeDto = {
    "granularity": "single",
    "stream_handling": "lockbox",
    "approximated": true,
    "supported_grants": ["all"],
    type
  } as StreamTypeDto;

  const streamDto = {
    "public_key": "Ut incididuntelit labore",
    "encrypted_private_key": "Duis Excepteur culpa repreаddsfdsfhenderit esse",
    "stream_type": type
  } as CreateStreamRequestBody;

  const keyPairA = cryptosdk.PRE.generateKeyPair();
  const keyPairB = cryptosdk.PRE.generateKeyPair();
  const reEncryptionKey: string = cryptosdk.PRE.generateReEncryptionKey(
    keyPairA.private_key,
    keyPairB.public_key
  );

  const data = Buffer.from('{"example":"JSON"}', 'utf8');
  const chunk: cryptosdk.PRE.LockboxWithContent = cryptosdk.PRE.lockboxEncrypt(
    keyPairA.public_key,
    data
  );
  const payload = util.bytesToHex(util.stringToBytes(JSON.stringify(chunk)));

  const grantDto = {
    stream_id: '',
    recipient_id: recipient_id,
    "properties": {
      reEncryptionKey,
      "e2eKey": "e2eKey"
    },
    "fromDate": "2020-01-01T00:00:00.000Z",
    "toDate": "2020-01-01T00:00:00.000Z",
    "type": GrantType.all
  } as GrantDto;

  const updatesUUID = uuid();
  const statusUpdateDto = {
    status_updates: [
      {
        "id": updatesUUID,
        "stream_id": "",
        "recorded_at": "2022-05-05T20:50:40.650Z",
        payload,
        "marker": {
          "started": true,
          "frequency": "15m"
        }
      }
    ]
  } as StatusUpdateDto;

  return {statusUpdateDto, updatesUUID, grantDto, streamDto, streamTypeDto, accessToken, data, keyPairA, keyPairB};
}

describe('WorkerController (e2e)', () => {
  let app: INestApplication;
  let agent = null;
  const address = `http://localhost:${process.env.CORE_STATUS_PORT}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppTestModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    agent = supertest(address)
    await app.init();
  });

  beforeEach(async () => {
    jest.resetModules()
    recievedMessage = null;
  });

  describe('handle PRE', () => {
    it('should handle PRE when recipient listens', async () => {
      // Prepare
      const {accessToken, streamTypeDto, streamDto, grantDto,
        statusUpdateDto, updatesUUID, keyPairB, data} = createDtos();

      // Act
      const defaultPostArgs = {agent, accessToken};
      await prepareStreamType(streamTypeDto, defaultPostArgs);
      const {body: stream} = await prepareStream(streamDto, defaultPostArgs);

      const stream_id = stream?.data?.id;
      grantDto.stream_id = stream_id;
      statusUpdateDto.status_updates[0].stream_id = stream_id;

      const {body: grant} = await prepareGrant(grantDto, defaultPostArgs);

      const grantChannel = CHANNEL_PREFIX + grant?.data?.id;
      await pubnub.subscribe({channels: [grantChannel]});

      await waitUntilSubscribed(grantChannel);

      await prepareStatus(statusUpdateDto, defaultPostArgs);

      // Check
      await waitForExpect(() => expect(recievedMessage.id).toEqual(updatesUUID));

      const {reencrypted_payload: reencryptedRaw} = recievedMessage as any;
      const reecryptedBytes = util.hexToBytes(reencryptedRaw);
      const reecryptedString = util.bytesToString(reecryptedBytes);
      const reecrypted  = JSON.parse(reecryptedString) as LockboxWithContent;

      const result: Buffer = cryptosdk.PRE.lockboxDecrypt(
        keyPairB.private_key,
        reecrypted.lockbox,
        Buffer.from(reecrypted.content)
      );

      expect(result).toEqual(data);
    });

    it('should not handle PRE if recipient absent', async () => {
      // Prepare
      const fakeRecipient = uuid();
      const {accessToken, streamTypeDto, streamDto, grantDto, statusUpdateDto} = createDtos();
      grantDto.recipient_id = fakeRecipient;
      // Act
      const defaultPostArgs = {agent, accessToken};

      await prepareStreamType(streamTypeDto, defaultPostArgs);
      const {body: stream} = await prepareStream(streamDto, defaultPostArgs);

      const stream_id = stream?.data?.id;
      grantDto.stream_id = stream_id;
      statusUpdateDto.status_updates[0].stream_id = stream_id;

      const {body: grant} = await prepareGrant(grantDto, defaultPostArgs);


      const grantChannel = CHANNEL_PREFIX + grant?.data?.id;
      await pubnub.subscribe({channels: [grantChannel]});
      await waitUntilSubscribed(grantChannel);

      await prepareStatus(statusUpdateDto, defaultPostArgs);

      // Check
      await waitForExpect(() => expect(recievedMessage).toEqual(null));
    })
  });

  afterAll(async () => {
    await app.close();
    await pubnub.unsubscribeAll();
  });
});
