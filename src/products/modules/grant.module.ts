import {Module} from '@nestjs/common';
import {GrantController} from '../controllers/grant.controller';
import {GrantEntity} from "../entity/grant.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GrantRepository} from "../repositories/grant.repository";
import {GrantStreamService} from "../services/grant_stream.service";

@Module({
    imports:[TypeOrmModule.forFeature([GrantEntity, GrantRepository])],
    controllers: [GrantController],
    providers: [GrantStreamService]
})
export class GrantModule {
}
