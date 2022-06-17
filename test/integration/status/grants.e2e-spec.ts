import {INestApplication} from "@nestjs/common";
import {getAccessToken} from "../../getacctoken";
import {v4 as uuid} from 'uuid';
import {PUBLIC_SCOPE, Scopes} from "../../../src/products/util/util";
import {GrantDto, GrantType} from "../../../src/products/dto/grant.model";
import setup from "./utils/setup";
import prepareAndTestStatusOperations from "./utils/prepare";
import prepareGrantAndExpect from "./utils/create-grant";
import before from "./utils/before";

import {
  allMightToken,
  allScopes,
  authType,
  uuidLength,
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

  describe('POST /api/v1/status/grants', () => {
    it('should return the grantId', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);

      // Act & Check
      const {id} = await prepareGrantAndExpect(agent, {streamId, type: GrantType.range});
      expect(id).toHaveLength(uuidLength);
    });

    it('should return id for range grant with valid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const tokenValidForRangeScope = getAccessToken(
        [Scopes.status_grants_manage, Scopes.status_grants_create_historical].join(' ')
      );

      // Act & Check
      const {id} = await prepareGrantAndExpect(agent, {
        streamId, type: GrantType.range, customToken: tokenValidForRangeScope
      });
      expect(id).toHaveLength(uuidLength);
    });

    it('should return 403 for range grant with invalid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const tokenInvalidForRangeScope = getAccessToken(Scopes.status_grants_manage);

      // Act & Check
      await prepareGrantAndExpect(agent, {
        streamId, type: GrantType.range, customToken: tokenInvalidForRangeScope, httpCode: 403
      });
    });

    it('should return id for all grant with valid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const tokenValidForRangeScope = getAccessToken([
        Scopes.status_grants_manage,
        Scopes.status_grants_create_live,
        Scopes.status_grants_create_historical
      ].join(' '));

      // Act & Check
      const {id} = await prepareGrantAndExpect(agent, {
        streamId, type: GrantType.all, customToken: tokenValidForRangeScope
      });
      expect(id).toHaveLength(uuidLength);
    });

    it('should return 403 for all grant with invalid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const tokenInvalidForRangeScope = getAccessToken([
        Scopes.status_grants_manage,
        Scopes.status_grants_create_live
      ].join(''));

      // Act & Check
      await prepareGrantAndExpect(agent, {
        streamId, type: GrantType.all, customToken: tokenInvalidForRangeScope, httpCode: 403
      });
    });

    it('should return id for latest grant with valid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const tokenValidForRangeScope = getAccessToken(
        [Scopes.status_grants_manage, Scopes.status_grants_create_live].join(' ')
      );

      // Act & Check
      const {id} = await prepareGrantAndExpect(agent, {
        streamId, type: GrantType.latest, customToken: tokenValidForRangeScope
      });
      expect(id).toHaveLength(uuidLength);
    });

    it('should return 403 for latest grant with invalid token scope', async () => {
      // Prepare
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const tokenInvalidForRangeScope = getAccessToken(Scopes.status_grants_manage);

      // Act & Check
      await prepareGrantAndExpect(agent, {
        streamId, type: GrantType.latest, customToken: tokenInvalidForRangeScope, httpCode: 403
      });
    });

    it('should not create second latest grant for same recipient and stream', async () => {
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const latestType = GrantType.latest;
      const {id, recipientIdToApply} = await prepareGrantAndExpect(agent, {streamId, type: latestType});
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
      const {streamId} = await prepareAndTestStatusOperations(agent, [supportedType]);
      const {id, recipientIdToApply} = await prepareGrantAndExpect(agent, {streamId, type: supportedType});
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
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const latestType = GrantType.latest;
      const {id, recipientIdToApply} = await prepareGrantAndExpect(agent, {streamId, type: latestType});
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

    it('should not create grant for not owned stream', async () => {
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const latestType = GrantType.latest;
      const {id, recipientIdToApply} = await prepareGrantAndExpect(agent, {streamId, type: latestType});
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
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const {id: rangedGrantId} = await prepareGrantAndExpect(agent, {streamId, type: GrantType.range});
      const {id: liveGrantId} = await prepareGrantAndExpect(agent, {streamId, type: GrantType.latest});
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
        .then(resp => ({id: resp?.body?.data?.id, ...resp?.body?.data}));

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
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const idsToDelete = [];
      await Promise.all(Object.values(GrantType).map(async type => {
        const {id} = await prepareGrantAndExpect(agent, {streamId, type});
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
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const invalidToken = getAccessToken();
      const idsToDelete = [];
      await Promise.all(Object.values(GrantType).map(async type => {
        const {id} = await prepareGrantAndExpect(agent, {streamId, type});
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

  describe('GET /api/v1/status/grants', () => {
    it('should return grant for known id', async () => {
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const {id} = await prepareGrantAndExpect(agent, {streamId, type: GrantType.range});

      // Run your end-to-end test
      const resp = await agent
        .get(`/api/v1/status/grants/${id}`)
        .auth(allMightToken, authType)
        .expect(200);

      expect(resp?.body?.data.id).toEqual(id);
    })

    it('should not return grant for unknown id', async () => {
      const randUUID = uuid();
      const {streamId} = await prepareAndTestStatusOperations(agent);
      await prepareGrantAndExpect(agent, {streamId, type: GrantType.range});

      // Run your end-to-end test
      const resp = await agent
        .get(`/api/v1/status/grants/${randUUID}`)
        .auth(allMightToken, authType)
        .expect(404);
    })

    it('should return my grants', async () => {
      const {streamId} = await prepareAndTestStatusOperations(agent);
      const {id: grantId} = await prepareGrantAndExpect(agent, {streamId, type: GrantType.range});

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
      const {streamId} = await prepareAndTestStatusOperations(agent);
      await prepareGrantAndExpect(agent, {streamId, type: GrantType.range, recipient_id});
      await prepareGrantAndExpect(agent, {streamId, type: GrantType.all, recipient_id});
      await prepareGrantAndExpect(agent, {streamId, type: GrantType.all});

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
      const {streamId} = await prepareAndTestStatusOperations(agent);
      await prepareGrantAndExpect(agent, {streamId, type: GrantType.range});
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
      await prepareAndTestStatusOperations(agent);

      // Act
      const resp = await agent
        .get('/api/v1/status/grants/forme')
        .auth(allMightToken, authType)
        .expect(200);

      // Check
      expect(resp?.body?.data.length).toEqual(0);
    })
  });

  afterAll(async () => {
    await app.close();
  });
})
