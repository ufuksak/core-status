import { IsArray, IsEnum, IsNotEmpty } from "class-validator";
import { GrantType } from "./grand.model";

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

  approximated: boolean;

  @IsArray()
  @IsEnum(GrantType, { each: true })
  supported_grants: GrantType[];

  @IsNotEmpty()
  type: string;
}