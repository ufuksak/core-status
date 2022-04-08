import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../entity/user.entity";
import {UserRepository} from "../repositories/user.repository";
import {StatusRepository} from "../repositories/status.repository";
import {UserController} from "../controllers/user.controller";
import {UserService} from "../services/user.service";
import {CountryCodeEntity} from "../entity/country_code.entity";
import {DeviceEntity} from "../entity/device.entity";
import {GpsEntity} from "../entity/gps.entity";
import {NotificationStatusEntity} from "../entity/notification_status.entity";
import {UserActionEntity} from "../entity/user_action.entity";
import {RegionEntity} from "../entity/region.entity";
import {StatusEntity} from "../entity/status.entity";
import {TimezoneEntity} from "../entity/tz.entity";
import {UploadImageModule} from "./uploadimage.module";
import {StatusService} from "../services/status.service";
import {StatusPublisher} from "../rabbit/status.publisher";
import {UserPublisher} from "../rabbit/user.publisher";
import {FileRepository} from "../repositories/file.repository";


@Module({
    imports: [
        UploadImageModule,
        TypeOrmModule.forFeature([
            UserEntity,
            CountryCodeEntity,
            DeviceEntity,
            GpsEntity,
            NotificationStatusEntity,
            RegionEntity,
            StatusEntity,
            TimezoneEntity,
            UserActionEntity,
            UserRepository,
            StatusRepository,
            FileRepository
        ])
    ],
    controllers: [UserController],
    providers: [
      UserService,
      StatusService,
      StatusPublisher,
      UserPublisher
    ]
})

export class UsersModule {}
