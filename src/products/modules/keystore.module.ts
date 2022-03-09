import {Module} from '@nestjs/common'
import {KeystoreController} from "../controllers/keystore.controller";
import {KeystoreService} from "../services/keystore";

@Module({
    imports: [],
    controllers: [KeystoreController],
    providers: [Object, KeystoreService],
})
export class KeystoreModule {
}
