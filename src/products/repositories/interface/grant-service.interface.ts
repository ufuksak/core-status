import {BaseServiceInterface} from './base-service.interface';
import {BaseEntityInterface} from './base-entity.interface';

export interface GrantServiceInterface extends BaseServiceInterface {

    findStream(id: string): Promise<BaseEntityInterface>;

}
