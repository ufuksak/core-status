import {INestApplication} from "@nestjs/common";
import setup from "./utils/setup";
import createStreamTypeAndExpect from "./utils/create-stream-type";
import createStreamAndExpect from "./utils/create-stream";
import before from "./utils/before";

import {
  allGrants,
  allMightToken,
  authType,
  streamType,
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

  describe('POST /api/v1/status/streams/types', () => {
    it('should create streamType', async () => createStreamTypeAndExpect(agent));
  });

  describe('GET /api/v1/status/streams/types', () => {
    it('should get all streamTypes', async () => {
      await createStreamTypeAndExpect(agent);
      await createStreamAndExpect(agent);
      const streamTypeOutput = {
        "granularity": 'single',
        "stream_handling": 'lockbox',
        "approximated": true,
        "supported_grants": allGrants,
        "type": streamType,
        "updated_at": expect.any(String),
        "created_at": expect.any(String),
        "id": expect.any(String)
      };

      // Run your end-to-end test
      const resp = await agent
        .get('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(allMightToken, authType)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(resp?.body?.data?.[0])
        .toEqual(streamTypeOutput)
    });
  });

  afterAll(async () => {
    await app.close();
  });
})
