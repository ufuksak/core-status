import {Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from "typeorm";
import {BaseEntity} from "./base.entity";
import {DeviceEntity} from "./device.entity";
import {StreamTypeEntity} from "./stream_type.entity";
import {FileEntity} from "./file.entity";
import {GrantEntity} from "./grant.entity";


@Entity({name: "stream", synchronize: true})
export class StreamEntity extends BaseEntity {
    @Column({type: 'uuid'})
    owner_id: string;

    @Column({type: 'uuid'})
    keypair_id: string;

    @Column({type: 'uuid'})
    device_id: string;

    @ManyToOne(() => StreamTypeEntity)
    @JoinColumn({ referencedColumnName: 'type' })
    type: string;

    @OneToMany(() => GrantEntity, grant => grant.stream_id, {cascade: true})
    @JoinTable()
    grants: GrantEntity[];
}