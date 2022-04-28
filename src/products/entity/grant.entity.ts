import {Column, Entity, ManyToOne } from "typeorm";
import { GrantType } from "../dto/grand.model";
import {BaseEntity} from "./base.entity";
import {StreamEntity} from "./stream.entity";

export interface GrantProperties {
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

    @Column({type: 'jsonb'})
    properties: GrantProperties;

    @Column({type: 'uuid'})
    recipient_id: string;

    @Column({type: 'uuid'})
    owner_id: string;

    @Column({type: 'timestamptz' })
    fromDate: string;

    @Column({type: 'timestamptz' })
    toDate: string;

    @ManyToOne(() => StreamEntity, stream => stream.id)
    stream_id: string;
}
