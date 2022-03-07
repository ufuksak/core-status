import {Module} from '@nestjs/common';
import {ProductsModule} from "./products/modules/products.module";
import {TypeOrmModule} from '@nestjs/typeorm';
import { UploadImageModule } from './products/modules/uploadimage.module';
import {RabbitModule} from "./products/modules/rabbit.module";
import {RABBIT_URI} from "./products/config/config";
import {ProducerModule} from "./products/modules/producer.module";
import {ConsumerModule} from "./products/modules/consumer.module";
import { ChannelModule } from './products/modules/channel.module';

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
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 26257,
            username: 'root',
            password: 'root',
            database: 'defaultdb',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            migrations: ['migrations/*.ts'],
        })
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
