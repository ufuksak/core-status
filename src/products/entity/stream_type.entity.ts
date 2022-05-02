import {Column, Entity, OneToMany} from "typeorm";
import {BaseEntity} from "./base.entity";
import {GrantType, StreamGranularity, StreamHandling} from "../dto/grand.model";
import {StreamEntity} from "./stream.entity";

@Entity({name: "stream_type", synchronize: true})
export class StreamTypeEntity extends BaseEntity {
    @Column({
        type: 'enum',
        enum: StreamGranularity
    })
    granularity: string;

    @Column({
        type: 'enum',
        enum: StreamHandling
    })
    stream_handling: string;

    @Column({
        type: 'boolean'
    })
    approximated: boolean;

    @Column('enum', {
        array: true,
        enum: GrantType
    })
    supported_grants: GrantType[];

    @Column({ unique: true, type: 'text' })
    type: string;

    @OneToMany(() => StreamEntity, stream => stream.streamType)
    streams: StreamEntity[];
}