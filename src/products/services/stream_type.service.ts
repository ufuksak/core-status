import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { StreamTypeDto } from "../dto/stream_type.model";
import { StreamTypeEntity } from "../entity/stream_type.entity";
import { StreamTypeRepository } from "../repositories/stream_type.repository";

@Injectable()
export class StreamTypeService {

    constructor(
      @InjectRepository(StreamTypeRepository) private readonly streamTypeRepo: StreamTypeRepository,
    ) {}

    async getAll(): Promise<StreamTypeEntity[]>{
      return await this.streamTypeRepo.getStreamTypes();
    };

    save(streamType: StreamTypeDto): Promise<StreamTypeEntity>{
      return this.streamTypeRepo.saveStreamType(streamType);
    };

    delete(id: string){
      return this.streamTypeRepo.deleteStreamType(id);
    };
}
