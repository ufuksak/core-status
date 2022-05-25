import {getAccessToken} from "../../../getacctoken";
import {v4 as uuid} from 'uuid';
import {StatusUpdateDto} from "../../../../src/products/dto/status.model";
import {Scopes} from "../../../../src/products/util/util";
import {GrantType} from "../../../../src/products/dto/grant.model";

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

export {
  allScopes,
  allMightToken,
  authType,
  uuidLength,
  streamType,
  allGrants,
  validStreamTypeCreateDto,
  validStreamCreateDto,
  statusUpdateTemplate,
  multipleStatusUpdateTemplate
}