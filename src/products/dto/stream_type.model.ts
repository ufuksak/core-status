import { IsArray, IsBoolean, IsEnum, IsNotEmpty, MaxLength } from "class-validator";
import { StreamTypeAvailable } from "../validators/stream-type.validator";
import { GrantType } from "./grant.model";

export enum StreamHandling {
  e2e = 'e2e',
  direct = 'direct',
  lockbox = 'lockbox'
}

export enum StreamGranularity {
  single = 'single',
  batch = 'batch'
}

export class StreamTypeDto  {
  @IsEnum(StreamGranularity)
  @IsNotEmpty()
  granularity: string;

  @IsEnum(StreamHandling)
  @IsNotEmpty()
  stream_handling: string;

  @IsBoolean()
  approximated: boolean;

  @IsArray()
  @IsEnum(GrantType, { each: true })
  supported_grants: GrantType[];

  @StreamTypeAvailable(false)
  @MaxLength(24)
  type: string;
}