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
import * as cryptosdk from 'globalid-crypto-library';
import {v4 as uuid} from 'uuid';
import {validationPipeOptions} from "../../src/products/config/validation-pipe.options";
import {StatusUpdateDto, UpdateMarker} from "../../src/products/dto/status.model";
import {PUBLIC_SCOPE, Scopes} from "../../src/products/util/util";
import {GrantEntity} from "../../src/products/entity/grant.entity";
import {GrantDto, GrantType} from "../../src/products/dto/grant.model";
import supertest = require("supertest");
import { AlgorithmType, Purpose } from "../../src/products/dto/keystore.byme.model";
import { decryptPayload, encryptPayload } from "../../src/products/util/pre";
import {addListener as transportInit} from "../../src/products/pubnub/pubnub";
import {Transport} from "../../src/products/pubnub/interfaces";

jest.setTimeout(3 * 60 * 1000);

type GrantPrepareOptions = {
  streamId: string,
  type: GrantType,
  customToken?: string,
  httpCode?: number,
  recipient_id?: string
}

const allScopes = Object.values(Scopes).join(' ');
const allMightUUID = uuid();
const allMightToken = getAccessToken(allScopes);

const authType = {type: "bearer"};
const uuidLength = 36;
const streamType = 'steamTypeToCreateValid';

const allGrants = Object.values(GrantType);

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

const statusUpdateTemplate: StatusUpdateDto = {
  status_updates: [
    {
      id: "9ad205e8-fde8-4853-94dc-911ffc35b31e",
      stream_id: "",
      recorded_at: "2022-04-28T23:05:46.944Z",
      payload: "someValidPayload",
      marker: {
        started: true,
        frequency: '15m',
        stopped: null
      }
    }
  ]
}

const multipleStatusUpdateTemplate: StatusUpdateDto = {
  status_updates: [
    {
      id: "9ad205e8-fde8-4853-94dc-981ffc35b31e",
      stream_id: "",
      recorded_at: "2022-04-26T23:05:46.944Z",
      payload: "someValidPayload",
      marker: {
        started: true,
        frequency: '15m',
        stopped: null
      }
    },
    {
      id: "9ad205e8-fde8-4853-94dc-981ffc35b31b",
      stream_id: "",
      recorded_at: "2022-04-27T23:05:46.944Z",
      payload: "someValidPayload",
      marker: {
        started: null,
        frequency: null,
        stopped: null
      }
    },
    {
      id: "9ad205e8-fde8-4853-94dc-981ffc35b31c",
      stream_id: "",
      recorded_at: "2022-04-28T23:05:46.944Z",
      payload: "someValidPayload",
      marker: {
        started: null,
        frequency: null,
        stopped: true
      }
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

    const transportConf: Transport.Config = {
      subscribeKey: 'sub-c-b791aa8d-6d5d-4f39-8de1-d81bc4dfe39e',
      publishKey: 'pub-c-2c1361ef-be16-4581-89aa-6be9df0c9910',
      logVerbosity: false,
      uuid: uuid(),
    }

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppUpdateTestModule), {fallbackOnErrors: true});
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    app.useGlobalFilters(new JsonApiExceptionTransformer());
    app.useGlobalInterceptors(new JsonApiTransformer());
    server = await app.getHttpServer();
    agent = await supertest.agent(server);
    transportInit(transportConf);
    await app.init();
  });

  beforeEach(async () => {
    await Promise.all([UpdateEntity, StreamEntity, StreamTypeEntity, GrantEntity]
      .map(el => truncateEntity(el))
    );
  });

  const prepareAndTestStatusOperations = async (supportedGrants?: [string]) => {
    await createStreamTypeAndExpect(supportedGrants);
    await createStreamAndExpect();
    const resp = await agent
      .get('/api/v1/status/streams')
      .set('Accept', 'application/json')
      .auth(allMightToken, authType)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    const randomUUID = uuid();
    const streamId = resp?.body?.data?.[0].id;

    const validStatusUpdates = {
      status_updates: multipleStatusUpdateTemplate.status_updates.map(el => {
        el.stream_id = streamId;
        return el;
      })
    };
    const statusUpdateId = validStatusUpdates.status_updates[0].id;

    await agent.post('/api/v1/status')
      .auth(allMightToken, authType)
      .send(validStatusUpdates)
      .expect(201);

    return {statusUpdateId, randomUUID, validStatusUpdates, streamId};
  }

  const getAllStatuses = async () => agent
    .get(`/api/v1/status`)
    .auth(allMightToken, authType)
    .expect(200);

  const createStreamTypeAndExpect = async (supportedGrants?: [string]) => {
    const supported_grants = supportedGrants || allGrants;
    const streamTypeOutput = {
      "granularity": 'single',
      "stream_handling": 'lockbox',
      "approximated": true,
      supported_grants,
      "type": streamType,
      "updated_at": expect.any(String),
      "created_at": expect.any(String)
    };

    const streamTypeData = {
      granularity: 'single',
      stream_handling: 'lockbox',
      approximated: true,
      supported_grants,
      type: streamType,
    };

    // Run your end-to-end test
    const resp = await agent
      .post('/api/v1/status/streams/types')
      .auth(allMightToken, authType)
      .set('Accept', 'application/json')
      .send(streamTypeData)
      .expect(201);

    expect(resp?.body?.data?.attributes).toEqual(streamTypeOutput);
  }

  describe('POST /api/v1/status/streams/types', () => {
    it('should create streamType', async () => createStreamTypeAndExpect());
  });

  const createStreamAndExpect = async () => {
    // prepare
    const streamData = {
      "stream_type": streamType,
      "public_key": "Ut incididuntelit labore",
      "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
    };

    // Act
    const resp = await agent
      .post('/api/v1/status/streams')
      .set('Accept', 'text/plain')
      .auth(allMightToken, authType)
      .send(streamData)
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(201);

    // Check
    expect(resp?.body?.data?.id).toHaveLength(uuidLength);
  };

  const prepareGrantAndExpect = async (options: GrantPrepareOptions) => {
    const {streamId, type} = options;
    const recipientIdToApply = options.recipient_id || uuid();
    const grantData = {
      "stream_id": streamId,
      recipient_id: recipientIdToApply,
      "properties": {
        e2eKey: '',
        reEncryptionKey: ''
      },
      "fromDate": "2020-01-01T00:00:00.000Z",
      "toDate": "2020-01-01T00:00:00.000Z",
      "type": type,
    } as GrantDto;

    // Run your end-to-end test
    const resp = await agent
      .post('/api/v1/status/grants')
      .set('Accept', 'text/plain')
      .auth(options.customToken || allMightToken, authType)
      .send(grantData)
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(options.httpCode || 201);

    return {id: resp?.body?.data?.id, recipientIdToApply};
  };

  describe('POST /api/v1/status/streams', () => {
    it('should create stream', async () => {
      await prepareAndTestStatusOperations();
    });
  });

  describe('POST /api/v1/status/grants', () => {
    it('should return the grantId', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();

      // Act & Check
      const {id} = await prepareGrantAndExpect({streamId, type: GrantType.range});
      expect(id).toHaveLength(uuidLength);
    });

    it('should return id for range grant with valid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const tokenValidForRangeScope = getAccessToken(
        [Scopes.status_grants_manage, Scopes.status_grants_create_historical].join(' ')
      );

      // Act & Check
      const {id} = await prepareGrantAndExpect({
        streamId, type: GrantType.range, customToken: tokenValidForRangeScope
      });
      expect(id).toHaveLength(uuidLength);
    });

    it('should return 403 for range grant with invalid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const tokenInvalidForRangeScope = getAccessToken(Scopes.status_grants_manage);

      // Act & Check
      await prepareGrantAndExpect({
        streamId, type: GrantType.range, customToken: tokenInvalidForRangeScope, httpCode: 403
      });
    });

    it('should return id for all grant with valid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const tokenValidForRangeScope = getAccessToken([
        Scopes.status_grants_manage,
        Scopes.status_grants_create_live,
        Scopes.status_grants_create_historical
      ].join(' '));

      // Act & Check
      const {id} = await prepareGrantAndExpect({
        streamId, type: GrantType.all, customToken: tokenValidForRangeScope
      });
      expect(id).toHaveLength(uuidLength);
    });

    it('should return 403 for all grant with invalid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const tokenInvalidForRangeScope = getAccessToken([
        Scopes.status_grants_manage,
        Scopes.status_grants_create_live
      ].join(''));

      // Act & Check
      await prepareGrantAndExpect({
        streamId, type: GrantType.all, customToken: tokenInvalidForRangeScope, httpCode: 403
      });
    });

    it('should return id for latest grant with valid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const tokenValidForRangeScope = getAccessToken(
        [Scopes.status_grants_manage, Scopes.status_grants_create_live].join(' ')
      );

      // Act & Check
      const {id} = await prepareGrantAndExpect({
        streamId, type: GrantType.latest, customToken: tokenValidForRangeScope
      });
      expect(id).toHaveLength(uuidLength);
    });

    it('should return 403 for latest grant with invalid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const tokenInvalidForRangeScope = getAccessToken(Scopes.status_grants_manage);

      // Act & Check
      await prepareGrantAndExpect({
        streamId, type: GrantType.latest, customToken: tokenInvalidForRangeScope, httpCode: 403
      });
    });

    it('should not create second latest grant for same recipient and stream', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const latestType = GrantType.latest;
      const {id, recipientIdToApply} = await prepareGrantAndExpect({streamId, type: latestType});
      expect(id).toHaveLength(uuidLength);

      const grantData = {
        "stream_id": streamId,
        recipient_id : recipientIdToApply,
        "properties": {
          e2eKey: '',
          reEncryptionKey: ''
        },
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": latestType,
      } as GrantDto;

      // Run your end-to-end test
      await agent
        .post('/api/v1/status/grants')
        .set('Accept', 'text/plain')
        .auth(allMightToken, authType)
        .send(grantData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(409);
    });

    it('should not create grant of unsupported type', async () => {
      const supportedType = GrantType.latest;
      const unsupportedType = GrantType.range;
      const {streamId} = await prepareAndTestStatusOperations([supportedType]);
      const {id, recipientIdToApply} = await prepareGrantAndExpect({streamId, type: supportedType});
      expect(id).toHaveLength(uuidLength);

      const grantData = {
        "stream_id": streamId,
        recipient_id : recipientIdToApply,
        "properties": {
          e2eKey: '',
          reEncryptionKey: ''
        },
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": unsupportedType,
      } as GrantDto;

      // Run your end-to-end test
      await agent
        .post('/api/v1/status/grants')
        .set('Accept', 'text/plain')
        .auth(allMightToken, authType)
        .send(grantData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(400);
    });

    it('should not create grant for unknown stream', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const latestType = GrantType.latest;
      const {id, recipientIdToApply} = await prepareGrantAndExpect({streamId, type: latestType});
      expect(id).toHaveLength(uuidLength);

      const grantData = {
        "stream_id": uuid(),
        recipient_id : recipientIdToApply,
        "properties": {
          e2eKey: '',
          reEncryptionKey: ''
        },
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": latestType,
      } as GrantDto;

      // Run your end-to-end test
      await agent
        .post('/api/v1/status/grants')
        .set('Accept', 'text/plain')
        .auth(allMightToken, authType)
        .send(grantData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(400);
    });

    it('should not creare grant for not owned stream', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const latestType = GrantType.latest;
      const {id, recipientIdToApply} = await prepareGrantAndExpect({streamId, type: latestType});
      expect(id).toHaveLength(uuidLength);

      const grantData = {
        "stream_id": uuid(),
        recipient_id : recipientIdToApply,
        "properties": {
          e2eKey: '',
          reEncryptionKey: ''
        },
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": latestType,
      } as GrantDto;

      const otherToken = getAccessToken(allScopes);
      // Run your end-to-end test
      await agent
        .post('/api/v1/status/grants')
        .set('Accept', 'text/plain')
        .auth(otherToken, authType)
        .send(grantData)
        .expect('Content-Type', "application/json; charset=utf-8")
        .expect(400);
    })

  });

  describe('PUT /api/v1/status/grants', () => {
    const route = '/api/v1/status/grants';
    const fromDate = new Date('2022-04-10T15:00:44.273Z').toISOString();
    const toDate = new Date('2022-05-10T15:00:44.273Z').toISOString();

    it('should modify grant range', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      const {id: rangedGrantId} = await prepareGrantAndExpect({streamId, type: GrantType.range});
      const {id: liveGrantId} = await prepareGrantAndExpect({streamId, type: GrantType.latest});
      const tokenInvalidForRangeScope = getAccessToken(Scopes.status_grants_manage);
      expect(rangedGrantId).toHaveLength(uuidLength);
      expect(liveGrantId).toHaveLength(uuidLength);

      // Act
      await agent
        .put(route + `/${rangedGrantId}`)
        .set('Accept', 'application/json')
        .auth(allMightToken, authType)
        .send({ fromDate, toDate })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(resp => ({id: resp?.body?.data?.id, ...resp?.body?.data?.attributes}));

      const grant =  await agent
        .put(route + `/${rangedGrantId}`)
        .set('Accept', 'application/json')
        .auth(allMightToken, authType)
        .send({ fromDate, toDate })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(resp => ({id: resp?.body?.data?.id, ...resp?.body?.data?.attributes}));

      expect(grant.fromDate).toEqual(fromDate);
      expect(grant.toDate).toEqual(toDate);

      await agent.put(route + `/${liveGrantId}`)
        .set('Accept', 'application/json')
        .auth(allMightToken, authType)
        .send({ fromDate, toDate })
        .expect('Content-Type', /json/)
        .expect(405)

    })
  })

  describe('DELETE /api/v1/status/grants', () => {
    it('should delete each type of grant and get 404 if grant not exists', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const idsToDelete = [];
      await Promise.all(Object.values(GrantType).map(async type => {
        const {id} = await prepareGrantAndExpect({streamId, type});
        expect(id).toHaveLength(uuidLength);
        idsToDelete.push(id);
      }));

      await Promise.all(idsToDelete.map(async el => {
        const route = `/api/v1/status/grants/${el}`;
        const resp =  await agent
          .delete(route)
          .set('Accept', 'application/json')
          .auth(allMightToken, authType)
          .send()
          .expect('Content-Type', /json/)
          .expect(200);

        expect(resp?.body?.data?.id).toEqual(resp?.body?.data?.id);

        await agent
          .delete(route)
          .set('Accept', 'application/json')
          .auth(allMightToken, authType)
          .send()
          .expect('Content-Type', /json/)
          .expect(404);
      }));
    });

    it('should reject invalid scoped token', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const invalidToken = getAccessToken();
      const idsToDelete = [];
      await Promise.all(Object.values(GrantType).map(async type => {
        const {id} = await prepareGrantAndExpect({streamId, type});
        expect(id).toHaveLength(uuidLength);
        idsToDelete.push(id);
      }));

      await Promise.all(idsToDelete.map(async el => {
        const route = `/api/v1/status/grants/${el}`;
        await agent
          .delete(route)
          .set('Accept', 'application/json')
          .auth(invalidToken, authType)
          .send()
          .expect('Content-Type', /json/)
          .expect(403);
      }));
    })
  })

  describe('GET /api/v1/status/streams/types', () => {
    it('should get all streamTypes', async () => {
      await createStreamTypeAndExpect();
      await createStreamAndExpect();
      const streamTypeOutput = {
        "granularity": 'single',
        "stream_handling": 'lockbox',
        "approximated": true,
        "supported_grants": allGrants,
        "type": streamType,
        "updated_at": expect.any(String),
        "created_at": expect.any(String)
      };

      // Run your end-to-end test
      const resp = await agent
        .get('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(allMightToken, authType)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(resp?.body?.data?.[0]['attributes'])
        .toEqual(streamTypeOutput)
    });
  });

  describe('DELETE /api/v1/status', () => {
    it('single deleted', async () => {
      // Prepare
      const {randomUUID, streamId} =
        await prepareAndTestStatusOperations();

      const getAllResponseLoaded = await getAllStatuses();
      const matched = getAllResponseLoaded.body?.data?.map(el => ({id: el.id, ...el.attributes}));
      const reallyToBeDeleted = matched[0];
      const reallyToBeDeletedId = reallyToBeDeleted.id;

      // make like 'deleted'
      reallyToBeDeleted.marker.deleted = true;
      reallyToBeDeleted.marker = expect.objectContaining({
        ...reallyToBeDeleted.marker
      });
      reallyToBeDeleted.payload = null;
      delete reallyToBeDeleted['stream'];

      // Act
      const deleteFailedResponse = await agent
        .delete(`/api/v1/status/${randomUUID}`)
        .auth(allMightToken, authType)
        .send({ stream_id: streamId })
        .expect(200);

      const deleteResponse = await agent
        .delete(`/api/v1/status/${reallyToBeDeletedId}`)
        .auth(allMightToken, authType)
        .send({ stream_id: streamId }).expect(200);

      const getStatusesResponseAfterCleaned = await getAllStatuses();
      const matchedAfterDeleted = getStatusesResponseAfterCleaned.body?.data?.map(el => ({
        id: el.id,
        ...el.attributes
      }));

      // Check
      expect(deleteFailedResponse?.body?.data?.id).toEqual(randomUUID);
      expect(deleteFailedResponse?.body?.data?.attributes?.comment).toEqual('update not found');
      expect(deleteResponse?.body?.data?.id).toEqual(reallyToBeDeletedId);
      expect(deleteResponse?.body?.data?.attributes?.comment).toEqual('deleted');


      expect(matchedAfterDeleted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...reallyToBeDeleted
          }),
          expect.objectContaining({
            ...(matched[1])
          }),
          expect.objectContaining({
            ...(matched[2])
          })
        ])
      );
    });

    it('mutliple deleted non-existing skipped', async () => {
      // Prepare
      const {randomUUID, validStatusUpdates, streamId: stream_id} =
        await prepareAndTestStatusOperations();
      const ids = validStatusUpdates.status_updates.map(el => el.id);
      ids.push(randomUUID);

      const getAllResponseLoaded = await getAllStatuses();
      const matched = getAllResponseLoaded.body?.data?.map(el => ({id: el.id, ...el.attributes}));

      // Act
      const deletedManyResponse = await agent
        .delete(`/api/v1/status`)
        .auth(allMightToken, authType)
        .send({ ids, stream_id }).expect(200);

      // Check
      const expectedResults = [
        {
          comment: "deleted"
        },
        {
          comment: "deleted"
        },
        {
          comment: "deleted"
        },
        {
          comment: "update not found"
        }
      ];
      const actualResults = deletedManyResponse.body.data.map(el => el.attributes);

      const getStatusesResponseAfterCleaned = await getAllStatuses();
      const matchedAfterDeleted = getStatusesResponseAfterCleaned.body?.data?.map(el => ({
        id: el.id,
        ...el.attributes
      }));

      const matchedDeleted = matched.map(el => {
        const result = {...el};
        result.marker.deleted = true;
        result.marker = expect.objectContaining({
          ...result.marker
        });
        result.payload = null;
        delete el['stream'];
        return result;
      });

      // Check
      expect(expectedResults).toEqual(actualResults);

      expect(matchedAfterDeleted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...(matchedDeleted[0])
          }),
          expect.objectContaining({
            ...(matchedDeleted[1])
          }),
          expect.objectContaining({
            ...(matchedDeleted[2])
          })
        ])
      );
    });

    it('multiple deleted by range', async () => {
      // Prepare
      const {validStatusUpdates, streamId: stream_id} =
        await prepareAndTestStatusOperations();

      const [first, second] = validStatusUpdates.status_updates;
      const from = new Date(first.recorded_at).toISOString();
      const to = new Date(second.recorded_at).toISOString();
      const fromTs = new Date(from).valueOf();
      const toTs = new Date(to).valueOf();

      // Act
      const getByRange = async () => agent
        .get(`/api/v1/status`)
        .query({from: fromTs, to: toTs})
        .auth(allMightToken, authType)
        .expect(200);

      const getByRangeResponseLoaded = await getByRange();

      const matched = getByRangeResponseLoaded.body?.data?.map(el => ({id: el.id, ...el.attributes}));

      const matchMarker = new UpdateMarker();
      expect(matched.length).toEqual(2);
      expect(matched[0].id).toEqual(validStatusUpdates.status_updates[0].id);
      expect(matched[1].id).toEqual(validStatusUpdates.status_updates[1].id);
      expect(matched[0].marker).toMatchObject(matchMarker);
      expect(matched[1].marker).toMatchObject(matchMarker);

      await agent.delete(`/api/v1/status/update/range`)
        .auth(allMightToken, authType)
        .send({from, to, stream_id})
        .expect(200);

      const getByRangeResponseAfterCleaned = await getByRange();
      const matchedAfterDeleted = getByRangeResponseAfterCleaned.body?.data?.map(el => ({
        id: el.id,
        ...el.attributes
      }));

      const matchedDeleted = matched.map(el => {
        const result = {...el};
        result.marker.deleted = true;
        result.marker = expect.objectContaining({
          ...result.marker
        });
        result.payload = null;
        delete el['stream'];
        return result;
      });

      expect(matchedAfterDeleted).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...(matchedDeleted[0])
          }),
          expect.objectContaining({
            ...(matchedDeleted[1])
          })
        ])
      );

    })
  });

  describe('GET /api/v1/status/grants', () => {
    it('should return grant for known id', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const {id} = await prepareGrantAndExpect({streamId, type: GrantType.range});

      // Run your end-to-end test
      const resp = await agent
        .get(`/api/v1/status/grants/${id}`)
        .auth(allMightToken, authType)
        .expect(200);

      expect(resp?.body?.data.id).toEqual(id);
    })

    it('should not return grant for unknown id', async () => {
      const randUUID = uuid();
      const {streamId} = await prepareAndTestStatusOperations();
      await prepareGrantAndExpect({streamId, type: GrantType.range});

      // Run your end-to-end test
      const resp = await agent
        .get(`/api/v1/status/grants/${randUUID}`)
        .auth(allMightToken, authType)
        .expect(404);
    })

    it('should return my grants', async () => {
      const {streamId} = await prepareAndTestStatusOperations();
      const {id: grantId} = await prepareGrantAndExpect({streamId, type: GrantType.range});

      // Run your end-to-end test
      const resp = await agent
        .get('/api/v1/status/grants/my')
        .auth(allMightToken, authType)
        .expect(200);

      expect(resp?.body?.data[0].id).toEqual(grantId);
    })

    it('should return forme grants', async () => {
      // Prepare
      const recipient_id = uuid()
      const formeToken = getAccessToken(allScopes, recipient_id);
      const {streamId} = await prepareAndTestStatusOperations();
      await prepareGrantAndExpect({streamId, type: GrantType.range, recipient_id});
      await prepareGrantAndExpect({streamId, type: GrantType.all, recipient_id});
      await prepareGrantAndExpect({streamId, type: GrantType.all});

      // Act
      const resp = await agent
        .get('/api/v1/status/grants/forme')
        .auth(formeToken, authType)
        .expect(200);

      // Check
      expect(resp?.body?.data.length).toEqual(2);
    })

    it('should not return my grants', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations();
      await prepareGrantAndExpect({streamId, type: GrantType.range});
      const publicToken = getAccessToken(PUBLIC_SCOPE.join(' '), uuid());
      // Act
      const resp = await agent
        .get('/api/v1/status/grants/my')
        .auth(publicToken, authType)
        .expect(200);

      // Check
      expect(resp?.body?.data.length).toEqual(0);
    })

    it('should not return forme grants', async () => {
      // Prepare
      await prepareAndTestStatusOperations();

      // Act
      const resp = await agent
        .get('/api/v1/status/grants/forme')
        .auth(allMightToken, authType)
        .expect(200);

      // Check
      expect(resp?.body?.data.length).toEqual(0);
    })
  });

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
      const gid_uuid = respStream?.body?.data?.attributes?.owner_id;

      const restKeys = await agent
        .post(`/api/v1/identity/keys/search`)
        .auth(token, authType)
        .send({ gid_uuid, purpose: Purpose.status_stream })
        .expect('Content-Type', /json/)
        .expect(201);

      const keyPublic_key = restKeys?.body?.data?.attributes?.key_pairs[0].public_key;

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
        "created_at": expect.any(String)
      };

      // Check
      expect(postResp?.body?.data.attributes).toEqual(grantOutput);
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

      const keyPublic_key = restKeys?.body?.data?.attributes?.key_pairs[0].public_key;

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

      const decryptedMessage = decryptPayload(statusUpdates[0].attributes.payload, userBKeysFromInternalStorage.private_key);

      const statusUpdateOutput = {
        stream_id: statusUpdate.stream_id,
        recorded_at: statusUpdate.recorded_at,
        marker: {
          ...statusUpdate.marker,
          deleted: false,
        },
        payload: expect.any(String),
        uploaded_at: expect.any(String),
      };

      // Check
      expect(statusUpdates[0].attributes).toEqual(statusUpdateOutput);
      expect(decryptedMessage).toEqual(originalPayload);
    });
  })

  afterAll(async () => {
    await app.close();
  });
})
