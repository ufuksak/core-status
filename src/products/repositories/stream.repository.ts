import {EntityRepository, FindManyOptions, FindOneOptions, Repository} from "typeorm";
import { StreamDto } from "../dto/stream.model";
import { StreamEntity } from "../entity/stream.entity";

@EntityRepository(StreamEntity)
export class StreamRepository extends Repository<StreamEntity> {

  saveStream(streamDto: StreamDto): Promise<StreamEntity> {
    const { type, ...streamEntity } = streamDto;
    streamEntity['type'] = type;

    return this.save(streamEntity);
  }

  getStream(options?: FindManyOptions<StreamEntity>): Promise<StreamEntity[]>{
    return this.find(options || {});
  }

  getStreamById(id: string, options?: FindOneOptions<StreamEntity>): Promise<StreamEntity> {
    return this.findOne(id, options);
  }

  deleteStream(id: string) {
    return this.delete(id);
  }
}
