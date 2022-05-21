import {
    Entity,
    PrimaryGeneratedColumn,
    OneToMany, CreateDateColumn, UpdateDateColumn,
} from "typeorm";

import {GrantEntity} from "./grant.entity";

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

    @OneToMany(type => GrantEntity, grant => grant.stream_id, {
        cascade: true
    })
    grants: GrantEntity[];
}
