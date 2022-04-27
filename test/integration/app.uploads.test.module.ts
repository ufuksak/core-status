import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UploadImageModule} from '../../src/products/modules/uploadimage.module';
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../src/products/config/config";
import {ConfigModule} from '@nestjs/config';
import {AmqpModule} from '@globalid/nest-amqp';
import config from "./ormconfig";
import {FileEntity} from "../../src/products/entity/file.entity";
import {FileRepository} from "../../src/products/repositories/file.repository";
import {CountryCodeEntity} from "../../src/products/entity/country_code.entity";
import {DeviceEntity} from "../../src/products/entity/device.entity";
import {GpsEntity} from "../../src/products/entity/gps.entity";
import {NotificationStatusEntity} from "../../src/products/entity/notification_status.entity";
import {RegionEntity} from "../../src/products/entity/region.entity";
import {StatusEntity} from "../../src/products/entity/status.entity";
import {TimezoneEntity} from "../../src/products/entity/tz.entity";
import {UserActionEntity} from "../../src/products/entity/user_action.entity";
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {Container} from "../../src/products/entity/container.entity";
import {Pot} from "../../src/products/entity/pot.entity";
import {DeviceModelEntity} from "../../src/products/entity/device_model.entity";
import {StreamEntity} from "../../src/products/entity/stream.entity";
import {StreamTypeEntity} from "../../src/products/entity/stream_type.entity";
import {GrantEntity} from "../../src/products/entity/grant.entity";


@Module({
    imports: [
        UploadImageModule,
        TypeOrmModule.forRoot({
            ...config,
            entities: [
                FileEntity,
                FileRepository,
                CountryCodeEntity,
                DeviceEntity,
                DeviceModelEntity,
                GpsEntity,
                NotificationStatusEntity,
                RegionEntity,
                StatusEntity,
                TimezoneEntity,
                UserActionEntity,
                StatusRepository,
                FileRepository,
                Container,
                Pot,
                StreamEntity,
                StreamTypeEntity,
                GrantEntity
            ]
        }),
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
    controllers: [],
    providers: [],
})
export class AppUploadsTestModule {}
