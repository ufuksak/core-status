import {Message} from "@globalid/nest-amqp";
import {Transform, Type} from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from "class-validator";
import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";

export interface GetUserStatusesInterface {
  from: number;
  to: number;
}

export class GetUserStatusesParams implements GetUserStatusesInterface {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  from: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  to: number;
}

export interface UpdateMarkerCreate {
  started: boolean,
  stopped: boolean,
  frequency: string
}

export interface UpdateMarkerInterface {
  started: boolean | null,
  stopped: boolean | null,
  frequency: string | null,
  deleted: boolean | null
}

export class UpdateMarker implements UpdateMarkerInterface {
  started: boolean | null;
  stopped: boolean | null;
  frequency: string | null;
  deleted: boolean | null;
}

export interface StatusResponse {
  id: string;
  stream_id: string;
  payload: string;
  recorded_at: string;
}

export interface AddStatusInterface {
  status_updates: StatusResponse[]
}

export class UpdateMarkerCreateDto implements UpdateMarkerCreate {
  @IsOptional()
  @IsBoolean()
  started: boolean | null;

  @IsOptional()
  @IsBoolean()
  stopped: boolean | null;

  @IsOptional()
  @IsString()
  frequency: string | null;
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

  @ValidateNested()
  @Type(() => UpdateMarkerCreateDto)
  marker: UpdateMarkerCreateDto;
}

export class StatusUpdateDto implements AddStatusInterface {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status_updates: StatusDto[]
}
