import {EntityRepository, Repository} from "typeorm";
import {UserEntity} from "../entity/user.entity";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

  saveUser = async (userDto: UserEntity) => {
    await this.save(userDto);
  }

  getUsers = async () => {
    return await this.find({ relations: ['status']});
  }

  getUserById = async (id: string) => {
    return await this.findOneOrFail(id, { relations: ['status']});
  }

  deleteUser = async (id: string) => {
    return await this.delete(id);
  }
}
