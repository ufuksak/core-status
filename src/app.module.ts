import {Module} from "@nestjs/common";
import {ProductsModule} from "./products/modules/products.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UploadImageModule} from "./products/modules/uploadimage.module";
import {CONFIG_VALIDATION_SCHEMA, configuration, RABBIT_URI} from "./products/config/config";
import {ChannelModule} from "./products/modules/channel.module";
import {KeystoreModule} from "./products/modules/keystore.module";
import config from "../ormconfig";
import {PotModule} from "./products/modules/pot.module";
import {ContainerModule} from "./products/modules/container.module";
import {AmqpModule} from "@globalid/nest-amqp";
import {ConfigModule} from "@nestjs/config";
import {TokenModule} from "@globalid/nest-auth";
import {StatusModule} from "./products/modules/status.module";

@Module({
  imports: [
    StatusModule,
    ConfigModule.forRoot({
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      isGlobal: true,
      load: [configuration]
    }),
    TokenModule,
    AmqpModule.forConfig({
      urlOrOpts: RABBIT_URI,
      defaultValidationOptions: {
        classTransform: { enableImplicitConversion: true },
        validate: true,
      },
    }),
    ProductsModule,
    UploadImageModule,
    ChannelModule,
    KeystoreModule,
    PotModule,
    ContainerModule,
    TypeOrmModule.forRoot(config)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
