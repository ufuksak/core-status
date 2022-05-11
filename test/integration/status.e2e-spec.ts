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
import {validationPipeOptions} from "../../src/products/config/validation-pipe.options";
import {StatusUpdateDto, UpdateMarker} from "../../src/products/dto/status.model";
import {
  GRANTS_CREATE_SCOPE,
  GRANTS_DELETE_SCOPE,
  GRANTS_MANAGE_SCOPE,
  STATUS_MANAGE_SCOPE
} from "../../src/products/util/util";
import {GrantEntity} from "../../src/products/entity/grant.entity";
import {GrantType} from "../../src/products/dto/grant.model";
import supertest = require("supertest");

jest.setTimeout(3 * 60 * 1000);


const token = getAccessToken([
  ...GRANTS_CREATE_SCOPE,
  ...GRANTS_DELETE_SCOPE,
  ...GRANTS_MANAGE_SCOPE,
  ...STATUS_MANAGE_SCOPE
].join(' '));

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

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppUpdateTestModule), {fallbackOnErrors: true});
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    app.useGlobalFilters(new JsonApiExceptionTransformer());
    app.useGlobalInterceptors(new JsonApiTransformer());
    server = await app.getHttpServer();
    agent = await supertest.agent(server);
    await app.init();
  });

  beforeEach(async () => {
    await Promise.all([UpdateEntity, StreamEntity, StreamTypeEntity, GrantEntity]
      .map(el => truncateEntity(el))
    );
  });

  const cleanup = async () => {
    await Promise.all([UpdateEntity, StreamEntity, StreamTypeEntity, GrantEntity]
      .map(el => truncateEntity(el))
    );
  };

  const prepareAndTestStatusDelete = async () => {
    await createStreamTypeAndExpect();
    await createStreamAndExpect();
    const resp = await agent
      .get('/api/v1/status/streams')
      .set('Accept', 'application/json')
      .auth(token, authType)
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
      .auth(token, authType)
      .send(validStatusUpdates)
      .expect(201);

    return {statusUpdateId, randomUUID, validStatusUpdates, streamId};
  }

  const getAllStatuses = async () => agent
    .get(`/api/v1/status`)
    .auth(token, authType)
    .expect(200);

  const createStreamTypeAndExpect = async () => {
    const streamTypeOutput = {
      "granularity": 'single',
      "stream_handling": 'lockbox',
      "approximated": true,
      "supported_grants": allGrants,
      "type": streamType,
      "updated_at": expect.any(String),
      "created_at": expect.any(String)
    };

    const streamTypeData = {
      granularity: 'single',
      stream_handling: 'lockbox',
      approximated: true,
      supported_grants: allGrants,
      type: streamType,
    };

    // Run your end-to-end test
    const resp = await agent
      .post('/api/v1/status/streams/types')
      .auth(token, authType)
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
      .auth(token, authType)
      .send(streamData)
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(201);

    // Check
    expect(resp?.body?.data?.id).toHaveLength(uuidLength);
  };

  const prepareGrantAndExpect = async (streamId: string, type: GrantType) => {
    const grantData = {
      "stream_id": streamId,
      "recipient_id": uuid(),
      "properties": {
        e2eKey: '',
        reEncryptionKey: ''
      },
      "fromDate": "2020-01-01T00:00:00.000Z",
      "toDate": "2020-01-01T00:00:00.000Z",
      "type": type,
    };

    // Run your end-to-end test
    const resp = await agent
      .post('/api/v1/status/grants')
      .set('Accept', 'text/plain')
      .auth(token, authType)
      .send(grantData)
      .expect('Content-Type', "application/json; charset=utf-8")
      .expect(201);

    return resp?.body?.data?.id;
  };

  describe('POST /api/v1/status/streams', () => {
    it('should create stream', async () => {
      await prepareAndTestStatusDelete();
    });
  });

  describe('POST /api/v1/status/grants', () => {
    it('should return the grantId', async () => {
      const {streamId} = await prepareAndTestStatusDelete();
      const id = await prepareGrantAndExpect(streamId, GrantType.range);
      expect(id).toHaveLength(uuidLength);
    })
  })

  describe('DELETE /api/v1/status/grants', () => {
    it('should delete each type of grant and get 404 if grant not exists', async () => {
      const {streamId} = await prepareAndTestStatusDelete();
      const idsToDelete = [];
      await Promise.all(Object.values(GrantType).map(async el => {
        const id = await prepareGrantAndExpect(streamId, el);
        expect(id).toHaveLength(uuidLength);
        idsToDelete.push(id);
      }));

      await Promise.all(idsToDelete.map(async el => {
        const route = `/api/v1/status/grants/${el}`;
        const resp =  await agent
          .delete(route)
          .set('Accept', 'application/json')
          .auth(token, authType)
          .send()
          .expect('Content-Type', /json/)
          .expect(200);

        expect(resp?.body?.data?.id).toEqual(resp?.body?.data?.id);

        await agent
          .delete(route)
          .set('Accept', 'application/json')
          .auth(token, authType)
          .send()
          .expect('Content-Type', /json/)
          .expect(404);
      }));
    });

    it('should reject invalid scoped token', async () => {
      const {streamId} = await prepareAndTestStatusDelete();
      const invalidToken = getAccessToken();
      const idsToDelete = [];
      await Promise.all(Object.values(GrantType).map(async el => {
        const id = await prepareGrantAndExpect(streamId, el);
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
        .auth(token, authType)
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
        await prepareAndTestStatusDelete();

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
        .auth(token, authType)
        .send({
          stream_id: streamId
        })
        .expect(200);

      const deleteResponse = await agent
        .delete(`/api/v1/status/${reallyToBeDeletedId}`)
        .auth(token, authType)
        .send({
          stream_id: streamId
        }).expect(200);

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
        await prepareAndTestStatusDelete();
      const ids = validStatusUpdates.status_updates.map(el => el.id);
      ids.push(randomUUID);

      const getAllResponseLoaded = await getAllStatuses();
      const matched = getAllResponseLoaded.body?.data?.map(el => ({id: el.id, ...el.attributes}));

      // Act
      const deletedManyResponse = await agent
        .delete(`/api/v1/status`)
        .auth(token, authType)
        .send({
          ids,
          stream_id
        }).expect(200);

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
        await prepareAndTestStatusDelete();

      const [first, second] = validStatusUpdates.status_updates;
      const from = new Date(first.recorded_at).toISOString();
      const to = new Date(second.recorded_at).toISOString();
      const fromTs = new Date(from).valueOf();
      const toTs = new Date(to).valueOf();

      // Act
      const getByRange = async () => agent
        .get(`/api/v1/status`)
        .query({from: fromTs, to: toTs})
        .auth(token, authType)
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
        .auth(token, authType)
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

      const createdStreamId = respStream?.body?.data?.id;
      const payload = 'some payload';
      const validUpdate = Object.assign({}, statusUpdateTemplate);
      validUpdate.status_updates[0].stream_id = createdStreamId;
      validUpdate.status_updates[0].payload = cryptosdk.PRE.encrypt(masterKeys.public_key, payload).cipher;
      await agent.post('/api/v1/status')
        .auth(token, authType)
        .send(validUpdate)
        .expect(201);
    });
  })

  afterAll(async () => {
    await app.close();
  });
})