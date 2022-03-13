import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {DeviceModelEntity} from "./device_model.entity";

@Entity({name: "device_build", synchronize: true})
export class DeviceBuildEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => DeviceModelEntity, deviceModel => deviceModel.id)
    dvc_model_id: DeviceModelEntity;

    @Column({nullable: true})
    build_ver: string;

    @Column({nullable: true})
    upgrade_loc: string;

    @Column({type: 'timestamptz', nullable: true})
    deprecate_utc: Date;

    @Column({type: 'timestamptz', nullable: true})
    allow_login_until_utc: Date;

    @Column({nullable: true})
    deprecated_msg: string;

    @Column({nullable: true})
    supports_remote_start_sms_flag: number;

    @Column({nullable: true})
    supports_ping_and_sync_sms_fla: number;

    @Column({type: 'timestamptz', nullable: true})
    update_utc: Date;

    @Column({nullable: true})
    update_app: string;
}
