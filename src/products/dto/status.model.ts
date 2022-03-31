
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "micro-kit-atlas/dist/routing";

export enum StatusTypes {
  AVAILABLE = 'Available',
  NOT_AVAILABLE = 'Not Available'
}

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
