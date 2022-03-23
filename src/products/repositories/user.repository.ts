import {EntityRepository, Repository} from "typeorm";
import {UserEntity} from "../entity/user.entity";
import {UserDto} from "../dto/user.model";
import { StatusDto } from "../dto/status.model";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

  saveUser = async (userDto: UserDto) => {
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

  saveStatus = async (id: string, status: StatusDto[]) => {

    const updatesStatus = await Promise.all(status.map(status => (
      this.manager.save(status)
    )))

    await this.update(id, { status: updatesStatus })

    return updatesStatus
  }
}
