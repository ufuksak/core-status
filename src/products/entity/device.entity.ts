import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "device", synchronize: true})
export class DeviceEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    dvc_id_t_description: string;

    @Column({nullable: false})
    validation_clause: string;

    @Column({nullable: false})
    validation_msg: string;

    @Column({nullable: false})
    update_app: string;

    @Column({nullable: false})
    ext_dvc_id_t_desc: string;

    @Column({nullable: false})
    ext_dvc_val_clause: string;

    @Column({nullable: false})
    ext_dvc_val_msg: string;

    @Column({nullable: false})
    ext_dvc_desc: string;
}
