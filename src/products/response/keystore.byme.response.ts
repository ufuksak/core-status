import {IsBoolean, IsNumber, IsString, IsUUID, MinLength} from "class-validator";
import {IsEnum, OrNull} from "micro-kit-atlas/routing";
import {AlgorithmType, Purpose} from "../dto/keystore.byme.model";

export interface PublicCreateAttributes {
    uuid: string
    algorithm_type: AlgorithmType
    client_id: string | null
    gid_uuid: string
    status: Status
    public_key: string | null
    encrypted_private_key: string | null
    version: number
    tag: string
    consent_id: string | null
    created_at?: string
    updated_at?: string
    purpose: Purpose | null
    external: boolean
    latest: boolean

    key_algorithm?: KeyAlgorithm.Attributes
}

export interface CreateAttributes extends PublicCreateAttributes {
    managed_key_id: string | null
}

export interface DateAttributes extends CreateAttributes {
    created_at: string
    updated_at: string
}

export namespace KeyAlgorithm {
    export interface Attributes {
        algorithm_type: AlgorithmType
        label: string
        min_app_version?: string

        key_pairs?: DateAttributes[]
    }
}

export enum Status {
    'pending' = 'pending',
    'confirmed' = 'confirmed',
    'declined' = 'declined',
    'expired' = 'expired',
}

export interface PublicCreateAttributes {
    uuid: string
    algorithm_type: AlgorithmType
    client_id: string | null
    gid_uuid: string
    status: Status
    public_key: string | null
    encrypted_private_key: string | null
    version: number
    tag: string
    consent_id: string | null
    created_at?: string
    updated_at?: string
    purpose: Purpose | null
    external: boolean
    latest: boolean

    key_algorithm?: KeyAlgorithm.Attributes
}

export interface ExposedAttributes extends PublicCreateAttributes {
    created_at: string
    updated_at: string
}

export class KeyPairAttributes implements ExposedAttributes {
    @IsUUID('4') uuid!: string
    @IsEnum(AlgorithmType) algorithm_type!: AlgorithmType
    @IsUUID('4') @OrNull() client_id!: string | null
    @IsUUID('4') gid_uuid!: string
    @IsEnum(Status) status!: Status
    @MinLength(16) @OrNull() public_key!: string | null
    @MinLength(16) @OrNull() encrypted_private_key!: string | null
    @IsNumber() version!: number
    @IsString() tag!: string
    @IsUUID('4') @OrNull() consent_id!: string | null
    @IsEnum(Purpose) @OrNull() purpose!: Purpose | null
    @IsBoolean() external!: boolean
    @IsBoolean() latest!: boolean
    created_at!: string
    updated_at!: string
}

export class KeyPairCreateResponse extends KeyPairAttributes {
    @IsUUID('4') device_id!: string
}
