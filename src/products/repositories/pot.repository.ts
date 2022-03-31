import {EntityRepository, Repository} from "typeorm";
import {PotInterface} from "./interface/pot.interface";
import {Pot} from "../entity/pot.entity";

@EntityRepository(Pot)
export class PotRepository extends Repository<PotInterface> {

    savePot = async (pot: PotInterface) => {
        await this.save(pot);
    }

    getPots = async () => {
        return await this.find();
    }

    getPotById = async (id: string) => {
        return await this.findOneOrFail(id);
    }

    deletePot = async (id: string) => {
        return await this.delete(id);
    }
}
