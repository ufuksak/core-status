import {Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import {BaseEntity} from "./base.entity";
import {DeviceEntity} from "./device.entity";
import {StreamTypeEntity} from "./stream_type.entity";


@Entity({name: "stream", synchronize: true})
export class StreamEntity extends BaseEntity {
    @ManyToOne(() => StreamTypeEntity, { nullable: false })
    @JoinColumn({ referencedColumnName: 'type' })
    type: string;

    @Column({type: 'uuid'})
    owner_id: string;

    @Column({type: 'uuid'})
    keypair_id: string;

    @ManyToOne(() => DeviceEntity, device => device.id)
    device_id: string;
}