import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { StatusDto } from "../dto/status.model";
import { UpdateEntity } from "../entity/update.entity";

@EntityRepository(UpdateEntity)
export class StatusRepository extends Repository<UpdateEntity> {

  saveStatus = async (statusDto: StatusDto) => {
    await this.save(statusDto);
  }

  getStatuses = async () => {
    return await this.find();
  }

  getStatusById = async (id: string, options?: FindOneOptions<UpdateEntity>) => {
    return await this.findOneOrFail(id, options);
  }

  deleteStatus = async (id: string) => {
    return await this.delete(id);
  }
}
