import {Module} from '@nestjs/common';
import {PotService} from '../services/pot.service';
import {PotController} from '../controllers/pot.controller';
import {Pot} from "../entity/pot.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PotRepository} from "../repositories/pot.repository";

@Module({
    imports:[TypeOrmModule.forFeature([Pot, PotRepository])],
    providers: [PotService],
    controllers: [PotController]
})
export class PotModule {
}
