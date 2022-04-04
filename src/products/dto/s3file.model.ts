import {IsNotEmpty, IsString, IsUUID} from "class-validator";
import {IsEnum} from "micro-kit-atlas/routing";
import {PayloadType} from "../entity/file.entity";

export class MassDeleteDto {
    @IsUUID('4',{each:true})
    ids: string[];
}

export class UploadQueryDto {
    @IsEnum(PayloadType)
    type: PayloadType
}

export class ParamUserId {
    @IsString()
    @IsNotEmpty()
    user_id: string;
}

export class ParamUUID4Dto extends ParamUserId {
    @IsUUID(4)
    file_id: string;
}
