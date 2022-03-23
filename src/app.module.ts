import {Module} from '@nestjs/common';
import {ProductsModule} from "./products/modules/products.module";
import {TypeOrmModule} from '@nestjs/typeorm';
import {UploadImageModule} from './products/modules/uploadimage.module';
import {RabbitModule} from "./products/modules/rabbit.module";
import {RABBIT_URI} from "./products/config/config";
import {ProducerModule} from "./products/modules/producer.module";
import {ConsumerModule} from "./products/modules/consumer.module";
import {ChannelModule} from './products/modules/channel.module';
import {KeystoreModule} from "./products/modules/keystore.module";
import {UsersModule} from "./products/modules/users.module";
import config  from '../ormconfig';

@Module({
    imports: [
        RabbitModule.registerAsync({
            url: RABBIT_URI,
            schema: {
                queues: ['TESTING_QUEUE'],
            },
        }),
        ProducerModule,
        ConsumerModule,
        ProductsModule,
        UploadImageModule,
        ChannelModule,
        KeystoreModule,
        UsersModule,
        TypeOrmModule.forRoot(config)
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
