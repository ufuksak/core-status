import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { UserDto } from "../dto/user.model";
import {UserEntity} from "../entity/user.entity";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

  saveUser = async (userDto: UserDto) => {
    await this.save(userDto);
  }

  getUsers = async () => {
    return await this.find();
  }

  getUserById = async (id: string, options?: FindOneOptions<UserEntity>) => {
    return await this.findOneOrFail(id, options);
  }

  deleteUser = async (id: string) => {
    return await this.delete(id);
  }
}
