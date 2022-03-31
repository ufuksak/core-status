import {BaseDto} from "./base.dto";
import {ContainerInterface} from "../repositories/interface/container.interface";

export class ContainerDto extends BaseDto implements ContainerInterface {
    readonly relations: Object;
}
