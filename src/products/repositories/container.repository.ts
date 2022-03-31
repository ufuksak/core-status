import {EntityRepository, Repository} from "typeorm";
import {ContainerInterface} from "./interface/container.interface";
import {Container} from "../entity/container.entity";

@EntityRepository(Container)
export class ContainerRepository extends Repository<ContainerInterface> {

    saveContainer = async (pot: ContainerInterface) => {
        await this.save(pot);
    }

    getContainers = async () => {
        return await this.find();
    }

    getContainerById = async (id: string) => {
        return await this.findOneOrFail(id);
    }

    deleteContainer = async (id: string) => {
        return await this.delete(id);
    }
}
