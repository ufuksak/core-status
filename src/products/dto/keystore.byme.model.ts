import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum Purpose {
    'messaging' = 'messaging',
    'encryption' = 'encryption',
    'signing' = 'signing',
    'annotations' = 'annotations',
    'device_encryption' = 'device-encryption',
    'status_sharing' = 'status-sharing',
    'status_stream' = 'status-stream',
}

export enum AlgorithmType {
    'ripple' = 'ripple',
    'rsa' = 'rsa',
    'ec' = 'ec',
}

export class KeystoreByMeDto {
  @IsString()
  @IsNotEmpty()
  public_key: string;

  @IsString()
  @IsNotEmpty()
  encrypted_private_key: string;

  @IsEnum(Purpose)
  @IsNotEmpty()
  purpose: string;

  @IsEnum(AlgorithmType)
  @IsNotEmpty()
  algorithm_type: string;
}