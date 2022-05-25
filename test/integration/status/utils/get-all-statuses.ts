import { allMightToken, authType } from "./mocks";

export default async function getAllStatuses(agent: any) {
  return agent
  .get('/api/v1/status')
  .auth(allMightToken, authType)
  .expect(200);
}
