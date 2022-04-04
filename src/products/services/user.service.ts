import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserRepository} from "../repositories/user.repository";
import { StatusDto, StatusResponse } from "../dto/status.model";
import { StatusEntity } from "../entity/status.entity";
import { FindOneOptions } from "typeorm";
import { UserDto } from "../dto/user.model";
import { UserEntity } from "../entity/user.entity";
import {UserServiceInterface} from "../repositories/interface/user-service.interface";
import {BaseService} from "./base.service";


@Injectable()
export class UserService extends BaseService implements UserServiceInterface {

    constructor(@InjectRepository(UserRepository) private readonly userRepo: UserRepository) {
        super();
    }

    insertUser = async (user: UserDto) => {
        await this.userRepo.saveUser(user);
        return user.id;
    }

    getAllUsers = async () => {
        return await this.userRepo.getUsers();
    }

    getUserById = async (id: string, options?: FindOneOptions<UserEntity>) => {
        return await this.userRepo.getUserById(id, options);
    }

    getUserByIdWithRel = async (id: string, options?: FindOneOptions<UserEntity>): Promise<UserEntity> => {
        return await this.userRepo.getUserById(id, options);
    }

    deleteUser = async (id: string) => {
        return await this.userRepo.deleteUser(id);
    }

    saveStatus = async (id: string, status: StatusDto[]): Promise<StatusResponse[]> => {

      const user = await this.getUserById(id, { relations: ["status"] });

      if (!user){
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      const statusEntities = status as StatusEntity[]

      user.status.push(...statusEntities)

      await this.userRepo.saveUser(user);

      return statusEntities.map(status => ({
        ...status,
        gid_uuid: id
      }));

    }
}
