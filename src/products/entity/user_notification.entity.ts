import {Column, Entity, ManyToOne} from "typeorm";
import {NotificationEntity} from "./notification.entity";
import {BaseEntity} from "./base.entity";

@Entity({name: "user_notification", synchronize: true})
export class UserNotificationEntity extends BaseEntity {

    @ManyToOne(() => NotificationEntity, notification => notification.id)
    notification: NotificationEntity;

    @Column({nullable: true})
    active: number;

    @Column({nullable: true})
    notification_address: string;

    @Column({nullable: true})
    update_utc: Date;

    @Column({nullable: true})
    update_app: string;
}
