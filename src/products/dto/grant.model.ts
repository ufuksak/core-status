import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { TimeRangeDto } from "./time_range.model";

export enum GrantType {
  range = 'range',
  all = 'all',
  latest = 'latest'
}

export class GrantProperties {
  @IsString()
  reEncryptionKey: string;

  @IsString()
  e2eKey: string;
}

export class GrantDto extends TimeRangeDto {
  @IsEnum(GrantType)
  @IsNotEmpty()
  type: GrantType;

  @ValidateNested()
  @Type(() => GrantProperties)
  properties: GrantProperties;

  @IsUUID('4')
  recipient_id: string;

  owner_id: string;

  @IsUUID('4')
  @IsNotEmpty()
  stream_id: string;
}
