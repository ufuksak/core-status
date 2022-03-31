import {BaseEntityInterface} from "./base-entity.interface";

export interface ContainerInterface extends BaseEntityInterface {

    pots?: BaseEntityInterface[];

    user?:  BaseEntityInterface;
}
