import { Module } from "@nestjs/common";
import { ProductsModule } from "./products/modules/products.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UploadImageModule } from "./products/modules/uploadimage.module";
import { ChannelModule } from "./products/modules/channel.module";
import { CacheModule } from "./products/modules/cache.module";
import { KeystoreModule } from "./products/modules/keystore.module";
import { ContainerModule } from "./products/modules/container.module";
import { AmqpModule } from "@globalid/nest-amqp";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenModule } from "@globalid/nest-auth";
import { StatusModule } from "./products/modules/status.module";
import { amqpOptions } from "./products/config/amqp.options";
import { configOptions } from "./products/config/config.options";
import ormOptions from "./products/config/orm.options";

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ormOptions,
    }),
    ConfigModule.forRoot(configOptions),
    AmqpModule.forConfig(amqpOptions),
    TokenModule,
    StatusModule,
    ProductsModule,
    UploadImageModule,
    ChannelModule,
    KeystoreModule,
    ContainerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
