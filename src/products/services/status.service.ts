import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { StatusDto, StatusResponse } from "../dto/status.model";
import { StatusRepository } from "../repositories/status.repository";

@Injectable()
export class StatusService {

    constructor(
      @InjectRepository(StatusRepository) private readonly statusRepo: StatusRepository
    ) {}

    save = async (userId: string, status: StatusDto[]): Promise<StatusResponse[]> => {
      const statusEntities = status.map(status => ({
        ...status,
        user_id: userId
      }));

      const result = await this.statusRepo
          .createQueryBuilder()
          .insert()
          .orIgnore()
          .values(statusEntities).execute();

      return result.generatedMaps.map((generatedColumns, index) => ({
        ...statusEntities[index],
        uploaded_at: generatedColumns.uploaded_at,
        gid_uuid: userId,
      })) as StatusResponse[];
    }
}
