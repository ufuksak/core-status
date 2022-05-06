import {Column, Entity, OneToMany, OneToOne} from "typeorm";
import {CountryCodeEntity} from "./country_code.entity";
import {DeviceModelEntity} from "./device_model.entity";
import {BaseEntity} from "./base.entity";
import {StreamEntity} from "./stream.entity";

@Entity({name: "device", synchronize: true})
export class DeviceEntity extends BaseEntity {
    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    serial_num: string;

    @Column({type: 'timestamptz', nullable: true})
    activate_utc: Date;

    @Column({nullable: true})
    latitude: number;

    @Column({nullable: true})
    longitude: number;

    @Column({nullable: true})
    enable_gps_flag: number;

    @Column({nullable: true})
    phone_num: string;

    @Column({nullable: true})
    last_ip_address: string;

    @OneToOne(() => DeviceModelEntity, deviceModel => deviceModel.id)
    dvc_model: DeviceEntity;

    @Column({nullable: true})
    min: string;

    @OneToOne(() => CountryCodeEntity, country => country.id)
    country_code: CountryCodeEntity;

    @Column({nullable: true})
    ban: boolean;

    @Column({nullable: true})
    firmware_ver: string;

    @Column({nullable: true})
    invalid_login_retry_count: number;

    @Column({type: 'timestamptz', nullable: true})
    dvc_block_utc: Date;

    @OneToMany(() => StreamEntity, stream => stream.device_id, { cascade: true })
    streams: StreamEntity[];
}
