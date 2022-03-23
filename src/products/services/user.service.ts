import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserRepository} from "../repositories/user.repository";
import {UserDto} from "../dto/user.model";
import { StatusDto, StatusResponse } from "../dto/status.model";

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserRepository) private readonly userRepo: UserRepository) {
    }

    insertUser = async (user: UserDto) => {
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

      const filteredStatus = status.filter(status => !status.uuid)

      const savedStatuses = await this.userRepo.saveStatus(id, filteredStatus)

      return savedStatuses.map(status => ({
        ...status,
        gid_uuid: id
      }));

    }
}
