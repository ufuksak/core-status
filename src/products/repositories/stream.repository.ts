import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import { StreamDto } from "../dto/stream.dto";
import { StreamEntity } from "../entity/stream.entity";

@EntityRepository(StreamEntity)
export class StreamRepository extends Repository<StreamEntity> {

  saveStream(statusDto: StreamDto): Promise<StreamEntity> {
    return this.save(statusDto);
  }

  getStream(): Promise<StreamEntity[]>{
    return this.find();
  }

  getStreamById(id: string, options?: FindOneOptions<StreamEntity>): Promise<StreamEntity> {
    return this.findOneOrFail(id, options);
  }

  deleteStream(id: string) {
    return this.delete(id);
  }
}
