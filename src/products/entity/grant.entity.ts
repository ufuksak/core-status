import {Column, Entity, ManyToOne, UpdateDateColumn } from "typeorm";
import { GrantProperties, GrantType } from "../dto/grant.model";
import {BaseEntity} from "./base.entity";
import {StreamEntity} from "./stream.entity";

@Entity({name: "grant", synchronize: true})
export class GrantEntity extends BaseEntity {
    @Column({
        type: 'enum',
        enum: GrantType
    })
    type: string;

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

    @UpdateDateColumn({
        type: "timestamptz",
        nullable: true
    })
    updated_at: string;
}
