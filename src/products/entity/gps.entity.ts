import {Column, Entity, ManyToOne} from "typeorm";
import {UserEntity} from "./user.entity";
import {BaseEntity} from "./base.entity";

@Entity({name: "gps",synchronize: true})
export class GpsEntity extends BaseEntity {

    @Column({nullable: false})
    device_id: string;

    @ManyToOne(() => UserEntity, user => user.gpsList)
    user: UserEntity;

    @Column({type: 'timestamptz', nullable: true})
    entry_utc: Date;

    @Column({nullable: true})
    speed: number;

    @Column({nullable: true})
    direction: number;

    @Column({nullable: true})
    latitude: number;

    @Column({nullable: true})
    longitude: number;

    @Column({nullable: true})
    street: string;

    @Column({nullable: true})
    suite: string;

    @Column({nullable: true})
    city: string;

    @Column({nullable: true})
    state_province: string;

    @Column({nullable: true})
    postal_code: string;

    @Column({nullable: true})
    country: string;
}
