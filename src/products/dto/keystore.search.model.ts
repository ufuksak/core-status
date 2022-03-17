import {IsUUID} from "class-validator";
import {IsEnum, OrUndefined} from "micro-kit-atlas/routing";
import {Purpose} from "../response/keystore.byme.response";

export interface KeyPairSearchQueryProps {
    gid_uuid: string | string[]
    purpose?: Purpose
}

export class PostKeyPairSearchBody implements KeyPairSearchQueryProps {
    @IsUUID('4', { each: true }) gid_uuid!: string | string[]
    @IsEnum(Purpose) @OrUndefined() purpose?: Purpose
}
