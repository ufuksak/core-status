import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "country_code", synchronize: true})
export class CountryCodeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: true})
    phone_country_code: string;

    @Column({nullable: true})
    iso_country_code: string;

    @Column({nullable: true})
    update_app : string;

    @Column({nullable: true})
    iso_country_code_keys: string;
}
