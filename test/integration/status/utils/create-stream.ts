import { allMightToken, authType, streamType, uuidLength } from "./mocks";

export default async function createStreamAndExpect(agent: any) {
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
