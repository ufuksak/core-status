import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";

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

export class ModifyGrantRangeDto {
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;
}

export class GrantDto extends ModifyGrantRangeDto {
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
