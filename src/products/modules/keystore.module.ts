import {Module} from '@nestjs/common'
import {KeystoreController} from "../controllers/keystore.controller";
import {KeystoreService} from "../services/keystore";
import {KeystorePublisher} from "../rabbit/keystore.publisher";

@Module({
    imports: [],
    controllers: [KeystoreController],
    providers: [KeystoreService, KeystorePublisher],
})
export class KeystoreModule {
}
