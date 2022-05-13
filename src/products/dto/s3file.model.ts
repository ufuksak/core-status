import {IsDateString, IsUUID} from "class-validator";
import {IsEnum} from "micro-kit-atlas/routing";
import {PayloadType} from "../entity/upload.entity";

export type DeletedUpdate = {id: string, comment: string};

export class UUUIDParam {
    @IsUUID('4')
    id: string;
}

export class MassDeleteDto {
    @IsUUID('4',{each:true})
    ids: string[];
}

export interface DeleteStatusDateRangeOptions {
    stream_id: string;
    from: string;
    to: string;
}

export class DeleteStatusDateRangeDto implements DeleteStatusDateRangeOptions {
    @IsUUID('4')
    stream_id: string;

    @IsDateString()
    from: string;

    @IsDateString()
    to: string;
}

export interface SingleSelectOptions {
    stream_id: string;
}

export interface SingleUpdateDeleteOptions {
    id: string;
    stream_id: string;
}

export interface MassUpdateDeleteOptions {
    ids: string[];
    stream_id: string;
}

export class SingleUpdateDeleteDto {
    @IsUUID('4')
    stream_id: string;
}

export class MassUpdateDeleteDto extends MassDeleteDto implements MassUpdateDeleteOptions {
    @IsUUID('4')
    stream_id: string;
}

export class UploadQueryDto {
    @IsEnum(PayloadType)
    type: PayloadType
}

export class ParamUUID4Dto {
    @IsUUID(4)
    file_id: string;
}
