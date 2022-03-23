import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import { UserEntity } from "./user.entity";

export enum StatusTypes {
  AVAILABLE = 'Available',
  NOT_AVAILABLE = 'Not Available'
}

@Entity({name: "status",synchronize: true})
export class StatusEntity {

    @PrimaryColumn({
      type:'uuid'
    })
    uuid: string;

    @Column({
      type: 'enum',
      enum: StatusTypes,
      nullable: false
    })
    type: string;

    @Column({type: 'timestamptz', nullable: false})
    recorded_at:Date

    @UpdateDateColumn({ type: "timestamptz" })
    uploaded_at:Date

    @Column({nullable: false})
    encrypted_payload: string;

    @ManyToOne(() => UserEntity, user => user.status)
    @JoinColumn({
      name: 'user_id'
    })
    user: UserEntity;
}
