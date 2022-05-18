import {IsArray, IsBoolean, IsEnum, IsNotEmpty, MaxLength} from "class-validator";
import {StreamTypeAvailable} from "../validators/stream-type.validator";
import {GrantType} from "./grant.model";
import {StreamGranularity, StreamHandling} from "./stream_handling.model";
import {MAX_STREAM_TYPE} from "../util/util";

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
  @MaxLength(MAX_STREAM_TYPE)
  type: string;
}
