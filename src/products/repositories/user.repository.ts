import { EntityRepository, FindOneOptions, Repository } from "typeorm";
import { UserDto } from "../dto/user.model";
import { UserEntity } from "../entity/user.entity";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  saveUser = async (userDto: UserDto) => {
    await this.save(userDto);
  };

  getUsers = async () => {
    return await this.find();
  };

  getUserById = async (id: string, options?: FindOneOptions<UserEntity>) => {
    const user = await this.findOne(id, options);
    if (!user) {
      throw new NotFoundException("user not found");
    }
    return user;
  };

  getUserStatuses = async (id: string) => {
    const user = await this.findOneOrFail({
      where: { id },
      relations: ["status"],
    });
    return user.status;
  };

  deleteUser = async (id: string) => {
    return await this.delete(id);
  };
}
