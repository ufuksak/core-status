import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppUpdateTestModule } from "./modules/app.update.test.module";
import { JsonApiExceptionTransformer } from "../../src/products/commons/transformer/jsonapi-exception.transformer";
import { JsonApiTransformer } from "../../src/products/commons/transformer/jsonapi.transformer";
import { useContainer } from "class-validator";
import { getAccessToken } from "../getacctoken";
import { truncateEntity } from "./helpers";
import { StreamEntity } from "../../src/products/entity/stream.entity";
import { StreamTypeEntity } from "../../src/products/entity/stream_type.entity";
import { UpdateEntity } from "../../src/products/entity/update.entity";
import { validationPipeOptions } from "../../src/products/config/validation-pipe.options";
import { Scopes } from "../../src/products/util/util";
import { GrantEntity } from "../../src/products/entity/grant.entity";
import { GrantDto, GrantType } from "../../src/products/dto/grant.model";
import { CHANNEL_PREFIX } from "../../worker/src/services/pubnub.service";
import {
  addListener as transportInit,
  getMessages,
  listPubnubChannelGroup,
  waitUntilSubscribed,
} from "../../src/products/pubnub/pubnub";
import * as Pubnub from "pubnub";
import { ListChannelsResponse } from "pubnub";
import { Transport } from "../../src/products/pubnub/interfaces";
import supertest = require("supertest");
import { PushNotificationMessage } from "../../src/products/model/pushnotification";

jest.setTimeout(3 * 60 * 1000);

type GrantPrepareOptions = {
  streamId: string;
  type: GrantType;
  customToken?: string;
  httpCode?: number;
  recipient_id?: string;
};

const allScopes = Object.values(Scopes).join(" ");
const allMightToken = getAccessToken(allScopes);

const authType = { type: "bearer" };
const uuidLength = 36;
const streamType = "streamentitys";

const allGrants = Object.values(GrantType);

describe("Pubnub (e2e)", () => {
  let app: INestApplication;
  let server = null;
  let agent = null;
  const recipient_id = "95abffad-9c5b-40da-ada5-a156418b64ef";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppUpdateTestModule],
    }).compile();

    const transportConf: Transport.Config = {
      subscribeKey: "sub-c-b791aa8d-6d5d-4f39-8de1-d81bc4dfe39e",
      publishKey: "pub-c-2c1361ef-be16-4581-89aa-6be9df0c9910",
      logVerbosity: true,
      uuid: recipient_id,
    };

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppUpdateTestModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    app.useGlobalFilters(new JsonApiExceptionTransformer());
    app.useGlobalInterceptors(new JsonApiTransformer());
    server = await app.getHttpServer();
    agent = await supertest.agent(server);
    transportInit(transportConf);
    await app.init();
  });

  beforeEach(async () => {
    await Promise.all(
      [UpdateEntity, StreamEntity, StreamTypeEntity, GrantEntity].map((el) =>
        truncateEntity(el)
      )
    );
  });

  const prepareAndTestStatusOperations = async (supportedGrants?: [string]) => {
    await createStreamTypeAndExpect(supportedGrants);
    await createStreamAndExpect();
    const resp = await agent
      .get("/api/v1/status/streams")
      .set("Accept", "application/json")
      .auth(allMightToken, authType)
      .send()
      .expect("Content-Type", /json/)
      .expect(200);

    return {
      streamId: resp?.body?.data?.[0].id,
      streamType: resp?.body?.data?.[0].type,
    };
  };

  const createStreamTypeAndExpect = async (supportedGrants?: [string]) => {
    const supported_grants = supportedGrants || allGrants;
    const streamTypeOutput = {
      granularity: "single",
      stream_handling: "lockbox",
      approximated: true,
      supported_grants,
      type: streamType,
      updated_at: expect.any(String),
      created_at: expect.any(String),
    };

    const streamTypeData = {
      granularity: "single",
      stream_handling: "lockbox",
      approximated: true,
      supported_grants,
      type: streamType,
    };

    // Run your end-to-end test
    const resp = await agent
      .post("/api/v1/status/streams/types")
      .auth(allMightToken, authType)
      .set("Accept", "application/json")
      .send(streamTypeData)
      .expect(201);

    expect(resp?.body?.data?.attributes).toEqual(streamTypeOutput);
  };

  const createStreamAndExpect = async () => {
    // prepare
    const streamData = {
      stream_type: streamType,
      public_key: "Ut incididuntelit labore",
      encrypted_private_key: "Duis Excepteur culpa reprehenderit esse",
    };

    // Act
    const resp = await agent
      .post("/api/v1/status/streams")
      .set("Accept", "text/plain")
      .auth(allMightToken, authType)
      .send(streamData)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(201);

    // Check
    expect(resp?.body?.data?.id).toHaveLength(uuidLength);
  };

  const prepareGrantAndExpect = async (options: GrantPrepareOptions) => {
    const { streamId, type } = options;
    const grantData = {
      stream_id: streamId,
      recipient_id: recipient_id,
      properties: {
        e2eKey: "",
        reEncryptionKey: "",
      },
      fromDate: "2020-01-01T00:00:00.000Z",
      toDate: "2020-01-01T00:00:00.000Z",
      type: type,
    } as GrantDto;

    // Run your end-to-end test
    const resp = await agent
      .post("/api/v1/status/grants")
      .set("Accept", "text/plain")
      .auth(options.customToken || allMightToken, authType)
      .send(grantData)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(options.httpCode || 201);

    return { id: resp?.body?.data?.id };
  };

  const deleteGrant = async (grantId: string) => {
    const route = `/api/v1/status/grants/${grantId}`;
    const resp = await agent
      .delete(route)
      .set("Accept", "application/json")
      .auth(allMightToken, authType)
      .send()
      .expect("Content-Type", /json/)
      .expect(200);

    expect(resp?.body?.data?.id).toEqual(resp?.body?.data?.id);

    await agent
      .delete(route)
      .set("Accept", "application/json")
      .auth(allMightToken, authType)
      .send()
      .expect("Content-Type", /json/)
      .expect(404);
  };

  const prepareGrantEntities = async (count: number, grantType: GrantType) => {
    const { streamId, streamType } = await prepareAndTestStatusOperations();
    let grantChannelArray = [];
    for (let i = 0; i < count; i++) {
      const { id } = await prepareGrantAndExpect({ streamId, type: grantType });
      grantChannelArray.push(CHANNEL_PREFIX + id);
    }
    const grantChannelGroup = `${streamType}_${recipient_id}`;
    return { grantChannelArray, grantChannelGroup };
  };

  describe("pubnub e2e", () => {
    it("e2e create channel group including multiple grant channels and list the channel group", async () => {
      // Arrange
      let { grantChannelArray, grantChannelGroup } = await prepareGrantEntities(
        3,
        GrantType.range
      );

      // Act
      await waitUntilSubscribed(grantChannelArray[0], recipient_id);
      const channelList: ListChannelsResponse = await listPubnubChannelGroup(
        grantChannelGroup
      );

      // Assert
      expect(channelList.channels).toContain(grantChannelArray[2]);
    });

    it("e2e create channel group and remove from the channel group and list the channel group channels", async () => {
      // Arrange
      let { grantChannelArray, grantChannelGroup } = await prepareGrantEntities(
        3,
        GrantType.range
      );
      await deleteGrant(grantChannelArray[2].replace(CHANNEL_PREFIX, ""));

      // Act
      await waitUntilSubscribed(grantChannelArray[0], recipient_id);
      const channelList: ListChannelsResponse = await listPubnubChannelGroup(
        grantChannelGroup
      );

      // Assert
      expect(channelList.channels).not.toContain(grantChannelArray[2]);
    });

    it("e2e create notifications when latest grants verify the messages are delivered", async () => {
      // Arrange
      let { grantChannelArray } = await prepareGrantEntities(
        1,
        GrantType.latest
      );

      // Act
      await waitUntilSubscribed(grantChannelArray[0], recipient_id);
      const messageResponse: Pubnub.FetchMessagesResponse = await getMessages(
        grantChannelArray[0]
      );
      const response = JSON.parse(
        messageResponse.channels[grantChannelArray[0]][0].message
      );
      let pubnubMessageResponse = <PushNotificationMessage>response;

      // Assert
      expect(pubnubMessageResponse.pn_apns.aps.alert.body).toBe(
        "Somebody shared his location with you."
      );
    });

    it("e2e should not create notifications when no latest grants verify no notifications are delivered", async () => {
      // Arrange
      let { grantChannelArray } = await prepareGrantEntities(
        1,
        GrantType.range
      );

      // Act
      await waitUntilSubscribed(grantChannelArray[0], recipient_id);
      const messageResponse: Pubnub.FetchMessagesResponse = await getMessages(
        grantChannelArray[0]
      );

      // Assert
      expect(messageResponse.channels).toMatchObject({});
    });

    it("e2e should add the per-grant channel to the per stream-type channel group", async () => {
      let { grantChannelArray, grantChannelGroup } = await prepareGrantEntities(
        1,
        GrantType.range
      );

      // Act
      await waitUntilSubscribed(grantChannelArray[0], recipient_id);
      const channelList: ListChannelsResponse = await listPubnubChannelGroup(
        grantChannelGroup
      );

      // Assert
      expect(channelList.channels).toContain(grantChannelArray[0]);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
