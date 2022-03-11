import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../entity/user.entity";
import {UserRepository} from "../repositories/user.repository";
import {UserController} from "../controllers/user.controller";
import {UserService} from "../services/user.service";
import {CountryCodeEntity} from "../entity/country_code.entity";
import { DeviceEntity } from "../entity/device.entity";
import {GpsEntity} from "../entity/gps.entity";
import {NotificationStatusEntity} from "../entity/notification_status.entity";
import {UserActionEntity} from "../entity/user_action.entity";
import {RegionEntity} from "../entity/region.entity";
import {StatusEntity} from "../entity/status.entity";
import {TimezoneEntity} from "../entity/tz.entity";

@Module({
    imports: [TypeOrmModule.forFeature([
        UserEntity,
        CountryCodeEntity,
        DeviceEntity,
        GpsEntity,
        NotificationStatusEntity,
        RegionEntity,
        StatusEntity,
        TimezoneEntity,
        UserActionEntity,
        UserRepository])],
    controllers: [UserController],
    providers: [UserService]
})
export class UsersModule {
}
