import {Column, Entity,ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity({name: "user_action",synchronize: true})
export class UserActionEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    description: string;

    @ManyToOne(() => UserEntity, user => user.status)
    user: UserEntity;
}
