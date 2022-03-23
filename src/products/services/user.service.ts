import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserRepository} from "../repositories/user.repository";
import { StatusDto, StatusResponse } from "../dto/status.model";
import { StatusEntity } from "../entity/status.entity";
import { UserEntity } from "../entity/user.entity";

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserRepository) private readonly userRepo: UserRepository) {
    }

    insertUser = async (user: UserEntity) => {
        await this.userRepo.saveUser(user);
        return user.id;
    }

    getAllUsers = async () => {
        return await this.userRepo.getUsers();
    }

    getUserById = async (id: string) => {
        return await this.userRepo.getUserById(id);
    }

    deleteUser = async (id: string) => {
        return await this.userRepo.deleteUser(id);
    }

    saveStatus = async (id: string, status: StatusDto[]): Promise<StatusResponse[]> => {
      const statusEntities = status.filter(status => !status.uuid) as StatusEntity[]

      if (!statusEntities.length){
        return []
      }

      const user = await this.getUserById(id)

      if (!user){
        throw new Error("User not found");
      }

      user.status = [
        ...user.status,
        ...statusEntities
      ]

      await this.userRepo.saveUser(user);

      return statusEntities.map(status => ({
        ...status,
        gid_uuid: id
      }));

    }
}
