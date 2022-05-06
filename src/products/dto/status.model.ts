import {Message} from "@globalid/nest-amqp";
import {Type} from "class-transformer";
import {IsArray, IsDateString, IsNotEmpty, IsString, IsUUID, ValidateNested,} from "class-validator";
import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";

export interface StatusResponse {
  id: string;
  stream_id: string;
  payload: string;
  recorded_at: string;
}

export interface AddStatusInterface {
  status_updates: StatusResponse[]
}

@Message({ name: STATUS_UPDATE_EXCHANGE })
export class StatusDto implements StatusResponse {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  stream_id: string;

  @IsString()
  @IsNotEmpty()
  payload: string;

  @IsDateString()
  @IsNotEmpty()
  recorded_at: string;
}

export class StatusUpdateDto implements AddStatusInterface {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status_updates: StatusDto[]
}
