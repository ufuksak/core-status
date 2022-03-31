import {CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

import {BaseEntityInterface} from '../repositories/interface/base-entity.interface';

export abstract class BaseEntity implements BaseEntityInterface {
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
}
