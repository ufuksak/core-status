import {Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from "typeorm";
import {BaseEntity} from "./base.entity";
import {StreamTypeEntity} from "./stream_type.entity";
import {GrantEntity} from "./grant.entity";
import {UpdateEntity} from "./update.entity";


export const streamEntityName = 'stream';

@Entity({name: streamEntityName, synchronize: true})
export class StreamEntity extends BaseEntity {
    @Column('uuid')
    owner_id: string;

    @Column('uuid')
    keypair_id: string;

    @Column('uuid')
    device_id: string;

    @Column('text')
    type: string;

    @ManyToOne(() => StreamTypeEntity, streamType => streamType.streams, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false
    })
    @JoinColumn({
        name: 'type',
        referencedColumnName: 'type'
    })
    streamType: StreamTypeEntity;

    @OneToMany(() => UpdateEntity, update => update.stream,  {cascade: true})
    @JoinTable()
    updates: UpdateEntity;

    @OneToMany(() => GrantEntity, grant => grant.stream_id, {cascade: true})
    @JoinTable()
    grants: GrantEntity[];
}
