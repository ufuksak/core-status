import { AmqpModule } from "@globalid/nest-amqp";
import {Module} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StreamTypeSubscriber } from "../subscribers/stream_type.subscriber";

import { configOptions } from "../../../src/products/config/config.options";
import { amqpOptions } from "../../../src/products/config/amqp.options";

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    AmqpModule.forConfig(amqpOptions),
  ],
  controllers: [StreamTypeSubscriber],
  providers: [],
})
export class AppModule {}
