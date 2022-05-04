import {ConflictException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { StreamTypeDto } from "../dto/stream_type.model";
import { StreamTypeEntity } from "../entity/stream_type.entity";
import { StreamTypeRepository } from "../repositories/stream_type.repository";
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from "../util/util";

@Injectable()
export class StreamTypeService {

    constructor(
      @InjectRepository(StreamTypeRepository) private readonly streamTypeRepo: StreamTypeRepository
    ) {}

    async getType(type: string): Promise<StreamTypeEntity> {
      return await this.streamTypeRepo.findOne({type})
    }

    async getAll(): Promise<StreamTypeEntity[]>{
      return await this.streamTypeRepo.getStreamTypes();
    };

    async save(streamType: StreamTypeDto): Promise<StreamTypeEntity>{
      try {
        return await this.streamTypeRepo.saveStreamType(streamType);
      } catch (e) {
        if (e.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException('type exists');
        }
      }
    };

    delete(id: string){
      return this.streamTypeRepo.deleteStreamType(id);
    };
}
