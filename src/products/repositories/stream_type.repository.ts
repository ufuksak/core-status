import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { StreamTypeDto } from "../dto/stream_type.model";
import { StreamTypeEntity } from "../entity/stream_type.entity";

@EntityRepository(StreamTypeEntity)
export class StreamTypeRepository extends Repository<StreamTypeEntity> {

  saveStreamType(statusDto: StreamTypeDto): Promise<StreamTypeEntity> {
    return this.save(statusDto);
  }

  getStreamTypes(): Promise<StreamTypeEntity[]>{
    return this.find();
  }

  getStreamTypeById(id: string, options?: FindOneOptions<StreamTypeEntity>): Promise<StreamTypeEntity> {
    return this.findOneOrFail(id, options);
  }

  deleteStreamType(id: string) {
    return this.delete(id);
  }
}
