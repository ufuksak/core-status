import {Message} from "@globalid/nest-amqp";
import {Type} from "class-transformer";
import {IsArray, IsDateString, IsEnum, IsNotEmpty, IsUUID, ValidateNested,} from "class-validator";
import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";

export enum StatusTypes {
  AVAILABLE = 'Available',
  NOT_AVAILABLE = 'Not Available'
}

@Message({ name: STATUS_UPDATE_EXCHANGE })
export class StatusDto {
  @IsUUID('4')
  @IsNotEmpty()
  uuid: string

  @IsNotEmpty()
  @IsEnum(StatusTypes)
  type: string

  @IsDateString()
  @IsNotEmpty()
  recorded_at: string

  @IsNotEmpty()
  encrypted_payload: string
}

export class StatusRequestBody {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
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
