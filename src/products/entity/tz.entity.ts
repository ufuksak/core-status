import {Column, Entity} from "typeorm";
import {BaseEntity} from "./base.entity";

@Entity({name: "tz", synchronize: true})
export class TimezoneEntity extends BaseEntity {

    @Column({nullable: true})
    tz_code: string;

    @Column({nullable: true})
    sequence_num: number;

    @Column({nullable: true})
    use_daylight: number;

    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    update_app: string;
}
