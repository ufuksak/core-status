import {ProductsModule} from "../../../src/products/modules/products.module";
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../../src/products/config/config";
import config from "../ormconfig";
import {ProductEntity} from "../../../src/products/entity/product.entity";
import {ProductRepository} from "../../../src/products/repositories/product.repository";
import {ConfigModule} from "@nestjs/config";
import {AmqpModule} from "@globalid/nest-amqp";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Module} from "@nestjs/common";

const configWithEntity = {...config, entities: [ProductEntity, ProductRepository]};

@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forRoot(configWithEntity),
    AmqpModule.forConfig({
      urlOrOpts: RABBIT_URI,
      defaultValidationOptions: { classTransform: { enableImplicitConversion: true }, validate: true },
    }),
    ConfigModule.forRoot({
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      isGlobal: true
    })
  ],
})
export class AppProductsTestModule {}
