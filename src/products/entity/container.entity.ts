import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany, CreateDateColumn, UpdateDateColumn,
} from "typeorm";

import {UserEntity} from "./user.entity";
import {Pot} from "./pot.entity";

@Entity()
export class Container {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn({
        type: "timestamptz",
        nullable: true
    })
    created_at: string;

    @UpdateDateColumn({
        type: "timestamptz",
        nullable: true
    })
    updated_at: string;

    @OneToMany(type => Pot, pot => pot.container, {
        cascade: true
    })
    pots: Pot[];

    @ManyToOne(type => UserEntity, user => user.containers)
    user: UserEntity;
}