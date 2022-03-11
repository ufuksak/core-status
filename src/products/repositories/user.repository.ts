import {EntityRepository, Repository} from "typeorm";
import {UserEntity} from "../entity/user.entity";
import {UserDto} from "../dto/user.model";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

    saveUser = async (userDto: UserDto) => {
        await this.save(userDto);
    }

    getUsers = async () => {
        return await this.find();
    }

    getUserById = async (id: string) => {
        return await this.findOneOrFail(id);
    }

    deleteUser = async (id: string) => {
        return await this.delete(id);
    }
}
