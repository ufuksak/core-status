import {Column, Entity, OneToOne} from "typeorm";
import {UserEntity} from "./user.entity";
import {DeviceEntity} from "./device.entity";
import {NotificationStatusEntity} from "./notification_status.entity";
import {BaseEntity} from "./base.entity";

@Entity({name: "notification", synchronize: true})
export class NotificationEntity extends BaseEntity {

    @OneToOne(() => UserEntity, user => user.id)
    usr_id: UserEntity;

    @OneToOne(() => DeviceEntity, device => device.id)
    dvc_id: DeviceEntity;

    @Column({nullable: true})
    phone_num: string;

    @Column({nullable: true})
    ip_address: string;

    @Column({nullable: true})
    ios_apn_dvc_token: string;

    @OneToOne(() => NotificationStatusEntity, notificationStatus => notificationStatus.id)
    last_notification_stat: NotificationStatusEntity;

    @Column({type: 'timestamptz', nullable: true})
    rqst_msg: string;

    @Column({type: 'timestamptz', nullable: true})
    rqst_utc: Date;

    @Column({nullable: true})
    actn_name: string;

    @Column({nullable: true})
    retry_count: number;

    @Column({type: 'timestamptz', nullable: true})
    last_sent_utc: Date;

    @Column({nullable: true})
    update_app: string;

    @Column({type: 'timestamptz', nullable: true})
    create_utc: Date;
}
