import {Column, Entity,ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity({name: "status",synchronize: true})
export class StatusEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false})
    description: string;

    @ManyToOne(() => UserEntity, user => user.status)
    user: UserEntity;
}
