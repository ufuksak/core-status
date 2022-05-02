import {IsArray, IsBoolean, IsEnum, IsNotEmpty, MaxLength} from "class-validator";
import {GrantType, StreamGranularity, StreamHandling} from "./grand.model";
import {StreamTypeAvailable} from "../validators/stream-type.validator";

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