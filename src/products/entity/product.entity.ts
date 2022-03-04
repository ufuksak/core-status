import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "product",synchronize: true})
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    title: string;

    @Column({nullable: false})
    description: string;

    @Column({nullable: false})
    price: number;

    @Column({nullable: false})
    unit: string;
}
