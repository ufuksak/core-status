import {AmqpModule} from "@globalid/nest-amqp";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {CONFIG_VALIDATION_SCHEMA, configuration} from "../../../src/config/config";
import {amqpOptions} from "../../../src/config/amqp.options";
import {PreSubscriber} from "../../../src/subscribers/pre.subscriber";
import {PubnubService} from "../../../src/services/pubnub.service";
import {CacheModule} from "../../../../src/products/modules/cache.module";
import {GrantSubscriber} from "../../../src/subscribers/grant.subscriber";

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
export class AppTestModule {}
