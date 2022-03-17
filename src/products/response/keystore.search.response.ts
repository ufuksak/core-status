import {IsArrayOf, IsEnum, OrNull} from "micro-kit-atlas/routing";
import {IsUUID, MinLength} from "class-validator";
import {AlgorithmType} from "../dto/keystore.byme.model";
import {Purpose} from "./keystore.byme.response";

export namespace KeyPair {
    export const PUBLIC_ATTRIBUTES: string[] = ['uuid', 'algorithm_type', 'gid_uuid', 'public_key', 'purpose']

    export interface PublicAttributes {
        uuid: string
        algorithm_type: AlgorithmType
        gid_uuid: string
        public_key: string | null
        purpose: Purpose | null
    }
}

export interface KeyPairSearchResponse {
    key_pairs: KeyPair.PublicAttributes[]
}

export class KeyPairPublic implements KeyPair.PublicAttributes {
    @IsUUID('4') uuid!: string
    @IsEnum(AlgorithmType) algorithm_type!: AlgorithmType
    @IsUUID('4') gid_uuid!: string
    @MinLength(16) @OrNull() public_key!: string | null
    @IsEnum(Purpose) @OrNull() purpose!: Purpose | null
}

export class KeyPairSearchResponse implements KeyPairSearchResponse {
    @IsArrayOf(KeyPairPublic) key_pairs!: KeyPairPublic[]
}
