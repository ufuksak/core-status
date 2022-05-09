import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export enum GrantType {
  range = 'range',
  all = 'all',
  latest = 'latest'
}

export class GrantProperties {
  reEncryptionKey: string;
  e2eKey: string;
}

export class GrantDto {
  @IsEnum(GrantType)
  @IsNotEmpty()
  type: string;

  properties: GrantProperties;

  @IsUUID('4')
  recipient_id: string;

  owner_id: string;

  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @IsUUID('4')
  @IsNotEmpty()
  stream_id: string;
}