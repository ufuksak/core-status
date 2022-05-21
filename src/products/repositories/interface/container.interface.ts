import {BaseEntityInterface} from "./base-entity.interface";

export interface ContainerInterface extends BaseEntityInterface {

    grants?: BaseEntityInterface[];

    user?:  BaseEntityInterface;
}
