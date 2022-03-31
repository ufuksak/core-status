import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {ContainerServiceInterface} from "../repositories/interface/container.service.interface";
import {BaseEntityInterface} from "../repositories/interface/base-entity.interface";
import {BaseService} from './base.service';
import {InjectRepository} from "@nestjs/typeorm";
import {ContainerRepository} from "../repositories/container.repository";

@Injectable()
export class ContainerService extends BaseService implements ContainerServiceInterface {
    constructor(@InjectRepository(ContainerRepository) public readonly repository: Repository<BaseEntityInterface>) {
        super()
    }

}
