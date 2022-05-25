import { allMightToken, authType, multipleStatusUpdateTemplate } from "./mocks";
import createStreamAndExpect from "./create-stream";
import createStreamTypeAndExpect from "./create-stream-type";
import {v4 as uuid} from 'uuid';

export default async function prepareAndTestStatusOperations (agent:any, supportedGrants?: [string]) {
  await createStreamTypeAndExpect(agent, supportedGrants);
  await createStreamAndExpect(agent);
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
