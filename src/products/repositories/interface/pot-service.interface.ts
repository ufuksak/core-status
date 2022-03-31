import {BaseServiceInterface} from './base-service.interface';
import {BaseEntityInterface} from './base-entity.interface';

export interface PotServiceInterface extends BaseServiceInterface {

    findUser(container_id: string): Promise<BaseEntityInterface>;

    findContainer(id: string): Promise<BaseEntityInterface>;

}
