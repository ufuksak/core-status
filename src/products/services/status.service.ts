import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {GetUserStatusesParams, StatusDto, StatusResponse, UpdateMarkerInterface} from "../dto/status.model";
import {StatusRepository} from "../repositories/status.repository";
import {UpdateEntity, updateEntityName} from "../entity/update.entity";
import {StreamRepository} from "../repositories/stream.repository";
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from "../util/util";
import {
  DeletedUpdate,
  DeleteStatusDateRangeOptions,
  MassUpdateDeleteOptions,
  SingleUpdateDeleteOptions
} from "../dto/s3file.model";
import {Between} from "typeorm";
import { GrantService } from "./grant.service";
import { TimeRangeDto } from "../dto/time_range.model";
import { reEncryptPayload } from "../util/pre";
import { CacheService } from "./cache.service";

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  constructor(
    @InjectRepository(StatusRepository) private readonly statusRepo: StatusRepository,
    @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
    private readonly grantService: GrantService,
    private readonly cacheService: CacheService,
  ) {
  }

  async getUserStatuses(owner_id: string, options: GetUserStatusesParams): Promise<UpdateEntity[]> {
    const where = {
      stream: {
        owner_id
      }
    };

    return this.filterStatusRange(options, where);
  }

  async getUserStatusByStreamId(recipient_id: string, stream_id: string, range: TimeRangeDto): Promise<UpdateEntity[]> {
    const grants = await this.grantService.getByRange(recipient_id, stream_id, range)

    this.grantService.checkContinuousRange(grants, range);

    const where = {
      stream: {
        id: stream_id
      },
      recorded_at: Between(range.fromDate, range.toDate)
    };

    const statusUpdates = await this.statusRepo.find({
      where,
      order: {
        uploaded_at: 'ASC'
      }
    });

    return Promise.all(statusUpdates.map(async statusUpdate => {
      const key = this.cacheService.buildStatusUpdateKey(recipient_id, stream_id, statusUpdate.id);

      let reencrypted_payload = await this.cacheService.get(key) as string;

      if(!reencrypted_payload){
        const grant = grants.find(grant => (
          new Date(grant.fromDate) <= statusUpdate.recorded_at && new Date(grant.toDate) >= statusUpdate.recorded_at
        ));
        const {properties} = grant;
        const { reEncryptionKey } = properties

        reencrypted_payload = reEncryptPayload(statusUpdate.payload, reEncryptionKey)

        await this.cacheService.set(key, reencrypted_payload);
      }

      statusUpdate.payload = reencrypted_payload;

      return statusUpdate;
    }))
  }

  private filterStatusRange(options: GetUserStatusesParams, where: any) {
    const {from, to} = options;
    if (from && to) {
      const pgFrom = new Date(from).toISOString()
      const pgTo = new Date(to).toISOString()
      where['recorded_at'] = Between(pgFrom, pgTo);
    }

    return this.statusRepo.find({
      where,
      relations: ['stream'],
      order: {
        uploaded_at: 'ASC'
      }
    });
  }

  async save(owner_id: string, statuses: StatusDto[]): Promise<StatusResponse[]> {
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
      if (!userStreamsMapping[el.stream_id]) {
        throw new BadRequestException('stream does not exist');
      }
    })


    const markerDefault: UpdateMarkerInterface = {
      started: null,
      stopped: null,
      frequency: null,
      deleted: false
    };

    for (const status of statuses) {
      try {
        status.marker = Object.assign({}, markerDefault, status.marker);

        const result = await this.statusRepo
          .createQueryBuilder()
          .insert()
          .values(status)
          .execute();

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

  async delete (userId: string) {
    return await this.statusRepo
      .createQueryBuilder()
      .delete().andWhere('id = \'' + userId + '\'').execute();
  }

  async checkStreamOwnership (owner_id: string, stream_id: string): Promise<void> {
    const maybeOwned = await this.streamRepo.getStream({ where: { owner_id, id: stream_id }});

    if(!maybeOwned.length) {
      throw new ForbiddenException('stream not owned or not exists');
    }
  }

  async removeStatusUpdate(owner_id: string, deleteParams: SingleUpdateDeleteOptions): Promise<DeletedUpdate> {
    const {id, stream_id} = deleteParams;
    await this.checkStreamOwnership(owner_id, stream_id);

    const where = `${updateEntityName}.id = :id AND ` +
      `${updateEntityName}.stream_id = :stream_id AND ` +
      `${updateEntityName}.marker->>'deleted' != 'true' `;

    const queryResult = await this.statusRepo
      .createQueryBuilder()
      .update()
      .set({
        payload: null,
        marker: () => `jsonb_set(marker, '{deleted}', 'true', TRUE)`
      })
      .where(where, { id, stream_id })
      .execute();

    return queryResult.affected ? { id, comment: 'deleted' } : { id, comment: 'update not found' };
  }

  async removeStatusUpdates (owner_id: string, deleteParams: MassUpdateDeleteOptions): Promise<DeletedUpdate[]> {
    const {ids, stream_id} = deleteParams;

    const where = `${updateEntityName}.id IN(:...ids) AND ` +
      `${updateEntityName}.stream_id = :stream_id AND ` +
      `${updateEntityName}.marker->>'deleted' != 'true' `;

    await this.checkStreamOwnership(owner_id, stream_id);

    const queryResult = await this.statusRepo
      .createQueryBuilder()
      .update()
      .set({
        payload: null,
        marker: () => `jsonb_set(marker, '{deleted}', 'true', TRUE)`
      })
      .where(where, { ids, stream_id })
      .returning('id')
      .execute();

    const affected = {};
    queryResult.raw.map(value => affected[value.id] = true);

    return ids.map(id => ({
      id,
      comment: affected[id] ? 'deleted' : 'update not found'
    }));
  }

  async removeStatusUpdatesByDateRange(
    owner_id: string, deleteParams: DeleteStatusDateRangeOptions): Promise<DeletedUpdate[]> {
    const {stream_id, from, to} = deleteParams;
    await this.checkStreamOwnership(owner_id, stream_id);

    const where = `${updateEntityName}.stream_id = :stream_id AND ` +
      `${updateEntityName}.marker->>'deleted' != 'true' AND ` +
      `${updateEntityName}.recorded_at BETWEEN :from AND :to`;

    const queryResult = await this.statusRepo
      .createQueryBuilder()
      .update()
      .set({
        payload: null,
        marker: () => `jsonb_set(marker, '{deleted}', 'true', TRUE)`
      })
      .where(where, {
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        stream_id
      })
      .returning('id')
      .execute();

    return queryResult.raw.map(value => ({
      id: value.id,
      comment: 'deleted'
    }))
  }
}
