import {EntityRepository, Repository} from "typeorm";
import { GrantDto } from "../dto/grant.model";
import {GrantEntity} from "../entity/grant.entity";

@EntityRepository(GrantEntity)
export class GrantRepository extends Repository<GrantEntity> {

    saveGrant(grantDto: GrantDto): Promise<GrantEntity> {
        return this.save(grantDto);
    }

    getGrants = async () => {
        return await this.find();
    }

    getGrantById = async (id: string) => {
        return await this.findOneOrFail(id);
    }

    deleteGrant = async (id: string) => {
        return await this.delete(id);
    }
}
