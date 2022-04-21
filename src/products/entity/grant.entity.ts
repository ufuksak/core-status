import {Column, Entity, ManyToOne } from "typeorm";
import {BaseEntity} from "./base.entity";
import {StreamEntity} from "./stream.entity";

export enum GrantType {
    range = 'range',
    all = 'all',
    latest = 'latest'
}

export interface GrantProperties {
    fromDate: string;
    toDate: string;
    reEncryptionKey: string;
    e2eKey: string;
}

@Entity({name: "grant", synchronize: true})
export class GrantEntity extends BaseEntity {
    @Column({
        type: 'enum',
        enum: GrantType
    })
    type: GrantType;

    @Column({
        type: 'jsonb'
    })
    properties: GrantProperties;

    @Column({
        type: 'uuid'
    })
    recipient_id: string;

    @Column({
        type: 'uuid'
    })
    owner_id: string;

    @ManyToOne(() => StreamEntity, stream => stream.id)
    stream_id: string;
}
