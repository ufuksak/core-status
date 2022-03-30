import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { StatusDto } from "../dto/status.model";
import { StatusEntity } from "../entity/status.entity";

@EntityRepository(StatusEntity)
export class StatusRepository extends Repository<StatusEntity> {

  saveStatus = async (statusDto: StatusDto) => {
    await this.save(statusDto);
  }

  getStatuses = async () => {
    return await this.find();
  }

  getStatusById = async (id: string, options?: FindOneOptions<StatusEntity>) => {
    return await this.findOneOrFail(id, options);
  }

  deleteStatus = async (id: string) => {
    return await this.delete(id);
  }
}
