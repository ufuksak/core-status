import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import { UserEntity } from "./user.entity";

export enum StatusTypes {
  AVAILABLE = 'Available',
  NOT_AVAILABLE = 'Not Available'
}

@Entity({name: "status",synchronize: true})
export class StatusEntity {

    @PrimaryGeneratedColumn('uuid')
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

    @ManyToOne(() => UserEntity, user => user.status)
    @JoinColumn({
      name: 'user_id'
    })
    user: UserEntity;
}
