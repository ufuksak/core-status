import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "notification_status", synchronize: true})
export class NotificationStatusEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    description: string;

    @Column({nullable: false})
    create_app: string;

    @Column({type: 'timestamptz', nullable: true})
    create_utc: Date;
}
