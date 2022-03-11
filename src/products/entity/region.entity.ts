import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "region", synchronize: true})
export class RegionEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    center_lat: number;

    @Column({nullable: true})
    center_lon: number;

    @Column({nullable: true})
    radius: number;

    @Column({nullable: true})
    vertices_old: string;

    @Column({nullable: true})
    update_app: string;

    @Column({nullable: true})
    vertices: string;

    @Column({nullable: true})
    bounding_vertices: string;

    @Column({nullable: true})
    convex_polygon: number;
}
