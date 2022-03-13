import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";
import {NotificationEntity} from "./notification.entity";

@Entity({name: "user_notification", synchronize: true})
export class UserNotificationEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => NotificationEntity, notification => notification.id)
    notification: NotificationEntity;

    @Column({nullable: true})
    active: number;

    @ManyToOne(() => UserEntity, user => user.id)
    user: UserEntity;

    @Column({nullable: true})
    notification_address: string;

    @Column({nullable: true})
    update_utc: Date;

    @Column({nullable: true})
    update_app: string;
}
