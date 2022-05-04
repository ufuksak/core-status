import {IsNotEmpty, IsString, IsUUID, MaxLength, MinLength} from "class-validator";
import {StreamTypeAvailable} from "../validators/stream-type.validator";

export class CreateStreamRequestBody {
  @StreamTypeAvailable(true)
  @MaxLength(24)
  stream_type: string;

  @IsString()
  @MinLength(16)
  encrypted_private_key: string;

  @IsString()
  @MinLength(16)
  public_key: string;
}

export class StreamDto {
  @IsNotEmpty()
  type: string;

  @IsUUID('4')
  @IsNotEmpty()
  owner_id: string;

  @IsUUID('4')
  @IsNotEmpty()
  keypair_id: string;

  @IsUUID('4')
  @IsNotEmpty()
  device_id: string;
}