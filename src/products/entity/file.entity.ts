import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {classToPlain, Exclude} from "class-transformer";
import {StreamEntity} from "./stream.entity";

export enum PayloadType {
    lockbox = 'lockbox',
    content = 'content'
}

@Entity({name: "file", synchronize: true})
export class FileEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true
    })
    key: string;

    @Column({
        nullable: true
    })
    location: string;

    @Column({
        nullable: true
    })
    bucket: string;

    @Column({
        nullable: true
    })
    etag: string;

    @Column({
        type: 'enum',
        enum: PayloadType
    })
    type: PayloadType;

    @Exclude()
    @Column({
        type: 'bytea',
        nullable: true
    })
    data: Uint8Array;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    user_id: string;

    toJSON() {
        const result = classToPlain(this);
        result['updated_at'] = this.updated_at.toISOString();
        result['created_at'] = this.created_at.toISOString();
        return result;
    }
}
