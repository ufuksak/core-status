import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "./base.entity";

@Entity({name: "product",synchronize: true})
export class ProductEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false})
    description: string;

    @Column({nullable: false})
    price: number;

    @Column({nullable: false})
    unit: string;
}
