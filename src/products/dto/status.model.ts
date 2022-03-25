
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { StatusTypes } from '../entity/status.entity';

export class StatusValidationPipe implements PipeTransform {
  transform(body: StatusRequestBody) {
    if (!body) {
      throw new BadRequestException('Status is required');
    }

    const { status_updates }  = body;

    if (!status_updates || status_updates.length === 0) {
      throw new BadRequestException('Status is required');
    }

    status_updates.forEach(status => {
      if (!status.uuid) {
        throw new BadRequestException('Status uuid is required');
      }
    });

    const uuids = status_updates.map(status => status.uuid);
    const uniqueUuids = [...new Set(uuids)];

    if (uuids.length !== uniqueUuids.length) {
      throw new BadRequestException('Status uuid must be unique');
    }

    status_updates.forEach(status => {
      if (!Object.values(StatusTypes).includes(status.type as StatusTypes)) {
        throw new BadRequestException(`Status type ${status.type} is invalid`);
      }
    });

    return body;
  }
}


export class StatusDto {

    constructor(
        public uuid: string,
        public type: string,
        public recorded_at: string,
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