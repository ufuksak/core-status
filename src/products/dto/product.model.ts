import { Message } from "@globalid/nest-amqp";
import {PRODUCT_UPDATE_EXCHANGE} from "../config/rabbit";

@Message({ name: PRODUCT_UPDATE_EXCHANGE })
export class ProductDto{

    constructor(public id: string, public title: string, public description: string, public price: number, unit: string) {
    }
}
