
import {GrantDto, GrantType} from "../../../../src/products/dto/grant.model";
import {v4 as uuid} from 'uuid';
import { allMightToken, authType } from "./mocks";

type GrantPrepareOptions = {
  streamId: string,
  type: GrantType,
  customToken?: string,
  httpCode?: number,
  recipient_id?: string
}

export default async function prepareGrantAndExpect (agent: any, options: GrantPrepareOptions) {
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
