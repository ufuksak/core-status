export class StatusDto {

    constructor(
        public uuid: string,
        public type: string,
        public recorded_at: string,
        public uploaded_at: string,
        public encrypted_payload: string,
    ) {

    }
}

export interface StatusRequestBody {
  status_updates: StatusDto[]
}

export interface StatusResponse {
  uuid: string,
  type: string,
  recorded_at: string,
  uploaded_at: string,
  gid_uuid: string,
  encrypted_payload: string,
}

export interface StatusResponseBody {
  status_updates: StatusResponse[]
}