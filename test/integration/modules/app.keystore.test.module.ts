import {KeystoreModule} from "../../../src/products/modules/keystore.module";
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../../src/products/config/config";
import {ConfigModule} from "@nestjs/config";
import {AmqpModule} from "@globalid/nest-amqp";
import {Module} from "@nestjs/common";


@Module({
  imports: [
    KeystoreModule,
    AmqpModule.forConfig({
      urlOrOpts: RABBIT_URI,
      defaultValidationOptions: {classTransform: {enableImplicitConversion: true}, validate: true},
    }),
    ConfigModule.forRoot({
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      isGlobal: true
    })
  ]
})
export class AppKeystoreTestModule {}