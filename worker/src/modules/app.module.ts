import {AmqpModule} from "@globalid/nest-amqp";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {CONFIG_VALIDATION_SCHEMA, configuration} from "../config/config";
import {amqpOptions} from "../config/amqp.options";
import {PreSubscriber} from "../subscribers/pre.subscriber";
import {PubnubService} from "../services/pubnub.service";


@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      isGlobal: true,
      load: [configuration]
    }),
    AmqpModule.forConfig(amqpOptions),
  ],
  controllers: [PreSubscriber],
  providers: [PubnubService],
})
export class AppModule {}
