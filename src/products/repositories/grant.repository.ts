import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { GrantDto } from "../dto/grant.model";
import { GrantEntity } from "../entity/grant.entity";

@EntityRepository(GrantEntity)
export class GrantRepository extends Repository<GrantEntity> {

  saveGrant(grantDto: GrantDto): Promise<GrantEntity> {
    return this.save(grantDto);
  }

  getGrants(): Promise<GrantEntity[]>{
    return this.find();
  }

  getGrantById(id: string, options?: FindOneOptions<GrantEntity>): Promise<GrantEntity> {
    return this.findOneOrFail(id, options);
  }

  deleteGrant(id: string) {
    return this.delete(id);
  }
}
