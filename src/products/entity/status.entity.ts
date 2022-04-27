import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {StatusTypes} from "../dto/status.model";
import {BaseEntity} from "./base.entity";

@Entity({name: "status",synchronize: true})
export class StatusEntity extends BaseEntity {

    @PrimaryColumn('uuid')
    uuid: string;

    @Column({
      type: 'enum',
      enum: StatusTypes,
      nullable: false
    })
    type: string;

    @Column({type: 'timestamptz', nullable: false})
    recorded_at:string

    @UpdateDateColumn({ type: "timestamptz" })
    uploaded_at:string

    @Column({nullable: false})
    encrypted_payload: string;

    @Column({ type: 'uuid'})
    user_id: string;
}
