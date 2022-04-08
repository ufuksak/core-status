import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { StatusDto, StatusResponse } from "../dto/status.model";
import { StatusRepository } from "../repositories/status.repository";
import {StatusPublisher} from "../rabbit/status.publisher";

@Injectable()
export class StatusService {

    constructor(
      @InjectRepository(StatusRepository) private readonly statusRepo: StatusRepository,
      private readonly statusPublisher: StatusPublisher
    ) {}

    save = async (userId: string, statuses: StatusDto[]): Promise<StatusResponse[]> => {
      for(const status of statuses) {
          status['user_id'] = userId;
          await this.statusPublisher.publishStatusUpdate(status);
      }

      const result = await this.statusRepo
          .createQueryBuilder()
          .insert()
          .orIgnore()
          .values(statuses).execute();

      return result.generatedMaps.map((generatedColumns, index) => ({
        ...statuses[index],
        uploaded_at: generatedColumns.uploaded_at,
        gid_uuid: userId,
      })) as StatusResponse[];
    }

    delete = async (userId: string) => {
        return await this.statusRepo
            .createQueryBuilder()
            .delete().andWhere('user_id = \'' + userId + '\'').execute();
    }
}
