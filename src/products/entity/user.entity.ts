import {Column, Entity, OneToMany} from "typeorm";
import {GpsEntity} from "./gps.entity";
import {StatusEntity} from "./status.entity";
import {UserActionEntity} from "./user_action.entity";
import {BaseEntity} from "./base.entity";
import {Container} from "./container.entity";

@Entity({name: "user",synchronize: true})
export class UserEntity extends BaseEntity {

    @Column({nullable: false})
    username: string;

    @Column({nullable: false})
    pin: string;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    surname: string;

    @Column({nullable: true})
    address_line_1: string;

    @Column({nullable: true})
    address_line_2: string;

    @Column({nullable: true})
    city: string;

    @Column({nullable: true})
    state_province: string;

    @Column({nullable: true})
    postal_code: string;

    @Column({nullable: true})
    country: string;

    @Column({nullable: true})
    phone_num: string;

    @Column({nullable: true})
    mobile_num: string;

    @Column({nullable: true})
    fax_num: string;

    @OneToMany(() => StatusEntity, status => status.user, { cascade: true })
    status: StatusEntity[];

    @Column({type: 'timestamptz', nullable: true})
    last_status_utc: Date;

    @Column({type: 'timestamptz', nullable: true})
    last_connection_utc: Date;

    @Column({type: 'timestamptz', nullable: true})
    available_utc: Date;

    @OneToMany(() => GpsEntity, gps => gps.user)
    gpsList: GpsEntity[];

    @OneToMany(() => UserActionEntity, user_action => user_action.user)
    actionList: UserActionEntity[];

    @OneToMany(type => Container, container => container.user, {
        cascade: true
    })
    containers: Container[];
}
