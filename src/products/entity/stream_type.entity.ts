import {Column, Entity } from "typeorm";
import {BaseEntity} from "./base.entity";
import {GrantType} from "../dto/grant.model";
import {StreamGranularity, StreamHandling} from "../dto/stream_type.model";

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
        enum: Object.values(GrantType)
    })
    supported_grants: string[];

    @Column({ unique: true, type: 'text' })
    type: string;
}