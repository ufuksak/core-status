import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {PotInterface} from '../repositories/interface/pot.interface';
import {BaseService} from './base.service';
import {PotServiceInterface} from '../repositories/interface/pot-service.interface';
import {BaseEntityInterface} from '../repositories/interface/base-entity.interface';
import {InjectRepository} from "@nestjs/typeorm";
import {PotRepository} from '../repositories/pot.repository';

@Injectable()
export class PotService extends BaseService implements PotServiceInterface {
    constructor(
        @InjectRepository(PotRepository)
        public readonly repository: Repository<PotInterface>) {
        super();
    }

    async findUser(id: string): Promise<BaseEntityInterface> {
        return await this.findContainer(id)
            .then(container =>
                container ?
                    this.repository.manager.findOne('container', container.id, {relations: ['user']})
                    : null
            )
            .then(container => container ? container['user'] : null);
    }

    async findContainer(id: string): Promise<BaseEntityInterface> {
        return await this.findRelationshipEntity(id, 'container')
    }
}
