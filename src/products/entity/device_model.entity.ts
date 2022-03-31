import {Column, Entity} from "typeorm";
import {BaseEntity} from "./base.entity";

@Entity({name: "device_model", synchronize: true})
export class DeviceModelEntity extends BaseEntity {

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    update_app: string;
}
