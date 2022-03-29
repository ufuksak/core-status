import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { StatusDto } from "../dto/status.model";
import { StatusEntity } from "../entity/status.entity";

@EntityRepository(StatusEntity)
export class StatusRepository extends Repository<StatusEntity> {

  saveUser = async (userDto: StatusDto) => {
    await this.save(userDto);
  }

  getUsers = async () => {
    return await this.find();
  }

  getUserById = async (id: string, options?: FindOneOptions<StatusEntity>) => {
    return await this.findOneOrFail(id, options);
  }

  deleteUser = async (id: string) => {
    return await this.delete(id);
  }
}
