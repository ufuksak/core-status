import {UsersModule} from "../../src/products/modules/users.module";
import {Module} from '@nestjs/common';
import {PotModule} from "../../src/products/modules/pot.module";
import {ContainerModule} from "../../src/products/modules/container.module";
import {UserPublisher} from "../../src/products/rabbit/user.publisher";
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../src/products/config/config";
import {ConfigModule} from "@nestjs/config";
import {AmqpModule} from "@globalid/nest-amqp";
import {TypeOrmModule} from "@nestjs/typeorm";
import config from "./ormconfig";
import {UserEntity} from "../../src/products/entity/user.entity";
import {CountryCodeEntity} from "../../src/products/entity/country_code.entity";
import {DeviceEntity} from "../../src/products/entity/device.entity";
import {DeviceModelEntity} from "../../src/products/entity/device_model.entity";
import {GpsEntity} from "../../src/products/entity/gps.entity";
import {NotificationStatusEntity} from "../../src/products/entity/notification_status.entity";
import {RegionEntity} from "../../src/products/entity/region.entity";
import {StatusEntity} from "../../src/products/entity/status.entity";
import {TimezoneEntity} from "../../src/products/entity/tz.entity";
import {UserActionEntity} from "../../src/products/entity/user_action.entity";
import {UserRepository} from "../../src/products/repositories/user.repository";
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {FileEntity} from "../../src/products/entity/file.entity";
import {Container} from "../../src/products/entity/container.entity";
import {Pot} from "../../src/products/entity/pot.entity";

const configWithEntity = {
    ...config,
    entities: [
        UserEntity,
        CountryCodeEntity,
        DeviceEntity,
        DeviceModelEntity,
        GpsEntity,
        NotificationStatusEntity,
        RegionEntity,
        StatusEntity,
        TimezoneEntity,
        UserActionEntity,
        UserRepository,
        StatusRepository,
        FileEntity,
        Container,
        Pot
    ]
};

@Module({
    imports: [
        UsersModule,
        PotModule,
        ContainerModule,
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
    providers: [UserPublisher]
})
export class AppUsersTestModule {}