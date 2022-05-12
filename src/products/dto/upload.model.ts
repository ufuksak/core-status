import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsEnum, IsISO8601, IsOptional, IsString, IsUUID} from "class-validator";
import {PayloadType} from "../entity/upload.entity";
import {UPLOAD_UPDATE_EXCHANGE} from "../config/rabbit";
import {Message} from "@globalid/nest-amqp";
import {Type} from "class-transformer";


export class ImageResponseDTO {
    @ApiPropertyOptional()
    ETag?: string;

    @ApiPropertyOptional()
    Location?: string;

    @ApiPropertyOptional()
    key?: string;

    @ApiPropertyOptional()
    Key?: string;

    @ApiPropertyOptional()
    Bucket?: string;
}

@Message({name: UPLOAD_UPDATE_EXCHANGE})
export class UploadDto {
    @IsUUID('4')
    id: string;

    @IsString()
    key: string;

    @IsOptional()
    @IsString()
    location: string;

    @IsOptional()
    @IsString()
    bucket: string;

    @IsOptional()
    @IsString()
    etag: string;

    @IsEnum(PayloadType)
    @Type(() => String)
    type: PayloadType;

    @IsISO8601()
    created_at: string;

    @IsISO8601()
    updated_at: string;

    @IsUUID('4')
    user_id: string;
}
