import {KEYSTORE_UPDATE_EXCHANGE} from "../config/rabbit";
import { Message } from "@globalid/nest-amqp";

@Message({ name: KEYSTORE_UPDATE_EXCHANGE})
export class KeystoreDto {

    constructor(
        public message: string,
        public nonce: string,
        public algorithm_type: string,
        public tag: string
    ) {
    }
}
