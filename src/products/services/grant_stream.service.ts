import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {BaseEntityInterface} from "../repositories/interface/base-entity.interface";
import {BaseService} from './base.service';
import {InjectRepository} from "@nestjs/typeorm";
import {GrantRepository} from "../repositories/grant.repository";
import {GrantServiceInterface} from "../repositories/interface/grant-service.interface";

@Injectable()
export class GrantStreamService extends BaseService implements GrantServiceInterface {
    constructor(
        @InjectRepository(GrantRepository) public readonly repository: Repository<BaseEntityInterface>
    ) {
        super()
    }

    findStream(id: string): Promise<BaseEntityInterface> {
        return this.repository.findOne(id);
    }
}
