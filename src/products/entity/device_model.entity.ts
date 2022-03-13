import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "device_model", synchronize: true})
export class DeviceModelEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    update_app: string;
}
