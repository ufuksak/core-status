import {AmqpModule} from "@globalid/nest-amqp";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {CONFIG_VALIDATION_SCHEMA, configuration} from "../config/config";
import {amqpOptions} from "../config/amqp.options";
import {PreSubscriber} from "../subscribers/pre.subscriber";
import { GrantSubscriber } from "../subscribers/grant.subscriber";
import {PubnubService} from "../services/pubnub.service";
import {CacheModule} from "../../../src/products/modules/cache.module";

@Module({
  imports: [
    CacheModule,
    ConfigModule.forRoot({
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      isGlobal: true,
      load: [configuration]
    }),
    AmqpModule.forConfig(amqpOptions),
  ],
  controllers: [PreSubscriber, GrantSubscriber],
  providers: [PubnubService],
})
export class AppModule {}
