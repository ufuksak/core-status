import {BadRequestException, Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {StatusDto, StatusResponse} from "../dto/status.model";
import {StatusRepository} from "../repositories/status.repository";
import {StatusPublisher} from "../rabbit/status.publisher";
import {UpdateEntity} from "../entity/update.entity";
import {StreamRepository} from "../repositories/stream.repository";
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from "../util/util";

@Injectable()
export class StatusService {
    private readonly logger = new Logger(StatusService.name);

    constructor(
      @InjectRepository(StatusRepository) private readonly statusRepo: StatusRepository,
      @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
      private readonly statusPublisher: StatusPublisher
    ) {}

    getUserStatuses = (owner_id: string): Promise<UpdateEntity[]> => {
      return this.statusRepo.find({
        where: {
          'stream': {
            owner_id
          }
        },
        relations: ['stream']
      });
    }

    save = async (owner_id: string, statuses: StatusDto[]): Promise<StatusResponse[]> => {
      const results = [];
      const userStreams = await this.streamRepo.getStream({
        where: {
          owner_id
        }
      });

      const userStreamsMapping = {};
      userStreams.forEach(el => userStreamsMapping[el.id] = true);

      statuses.forEach(el => {
        el['owner_id'] = owner_id;
        if(!userStreamsMapping[el.stream_id]) {
          throw new BadRequestException('stream does not exist');
        }
      })

      for(const status of statuses) {
        try {
          const result = await this.statusRepo
            .createQueryBuilder()
            .insert()
            .values(status)
            .execute();

          await this.statusPublisher.publishStatusUpdate(status);

          results.push(...result.generatedMaps?.map((generatedColumns, index) => ({
            ...status,
            uploaded_at: generatedColumns.uploaded_at,
          })))
        } catch (e) {
          if (e.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
            results.push({
              'comment': 'already exists'
            });
          } else {
            this.logger.error(e.message);
            throw new InternalServerErrorException();
          }
        }
      }
      return results;
    }

    delete = async (userId: string) => {
        return await this.statusRepo
            .createQueryBuilder()
            .delete().andWhere('user_id = \'' + userId + '\'').execute();
    }
}
