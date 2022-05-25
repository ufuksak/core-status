import {INestApplication} from "@nestjs/common";
import setup from "./utils/setup";
import prepareAndTestStatusOperations from "./utils/prepare";
import before from "./utils/before";

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

  describe('POST /api/v1/status/streams', () => {
    it('should create stream', async () => {
      await prepareAndTestStatusOperations(agent);
    });
  });

  afterAll(async () => {
    await app.close();
  });
})
