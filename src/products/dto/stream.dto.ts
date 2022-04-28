import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateStreamRequestBody {
  streamType: string;
  encryptedPrivateKey: string;
  publicKey: string;
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