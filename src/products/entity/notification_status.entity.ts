import {Column, Entity} from "typeorm";
import {BaseEntity} from "./base.entity";

@Entity({name: "notification_status", synchronize: true})
export class NotificationStatusEntity extends BaseEntity {

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    description: string;

    @Column({nullable: false})
    create_app: string;

    @Column({type: 'timestamptz', nullable: true})
    create_utc: Date;
}
