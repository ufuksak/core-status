import {Module} from "@nestjs/common";
import {ContainerController} from "../controllers/container.controller";
import {ContainerService} from "../services/container.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Container} from "../entity/container.entity";
import {ContainerRepository} from "../repositories/container.repository";

@Module({
    imports:[TypeOrmModule.forFeature([Container, ContainerRepository])],
    controllers:[ContainerController],
    providers:[ContainerService]
})
export class ContainerModule{}
