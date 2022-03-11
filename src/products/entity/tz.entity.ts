import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "tz", synchronize: true})
export class TimezoneEntity {

    @PrimaryGeneratedColumn()
    id: number;

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
