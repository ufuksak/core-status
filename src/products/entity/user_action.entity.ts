import {Column, Entity, ManyToOne} from "typeorm";
import {UserEntity} from "./user.entity";
import {BaseEntity} from "./base.entity";

@Entity({name: "user_action", synchronize: true})
export class UserActionEntity extends BaseEntity {

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    description: string;

    @ManyToOne(() => UserEntity, user => user.status)
    user: UserEntity;
}
