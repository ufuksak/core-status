import { allGrants, allMightToken, authType, streamType } from "./mocks";


export default async function createStreamTypeAndExpect(agent: any, supportedGrants?: [string]){
  const supported_grants = supportedGrants|| allGrants;
  const streamTypeOutput = {
    "granularity": 'single',
    "stream_handling": 'lockbox',
    "approximated": true,
    supported_grants,
    "type": streamType,
    "updated_at": expect.any(String),
    "created_at": expect.any(String),
    "id": expect.any(String)
  };

  const streamTypeData = {
    granularity: 'single',
    stream_handling: 'lockbox',
    approximated: true,
    supported_grants,
    type: streamType
  };

  // Run your end-to-end test
  const resp = await agent
    .post('/api/v1/status/streams/types')
    .auth(allMightToken, authType)
    .set('Accept', 'application/json')
    .send(streamTypeData)
    .expect(201);

  expect(resp?.body?.data).toEqual(streamTypeOutput);
}
