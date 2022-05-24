import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {GrantEntity} from "../entity/grant.entity";
import {GrantDto, GrantType} from "../dto/grant.model";
import {GrantRepository} from "../repositories/grant.repository";
import {QueryOptions} from "../repositories/query.options";
import {BaseService} from "./base.service";
import {StreamService} from "./stream.service";
import {Scopes} from "../util/util";
import {
  ChannelGroupRemovalError,
  GrantInvalidTokenScopeException,
  GrantNotFoundException,
  GrantOperationNotAllowed,
  SingletonGrantExists
} from "../exception/response.exception";
import {TokenData} from "@globalid/nest-auth";
import { TimeRangeDto } from "../dto/time_range.model";
import * as _ from "lodash";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import {SubscribersService} from "./subscribers.service";

@Injectable()
export class GrantService extends BaseService {

  constructor(
    @InjectRepository(GrantRepository) public readonly repository: GrantRepository,
    private streamService: StreamService,
    private readonly subscribersService: SubscribersService
  ) {
    super();
  }

  async get(id: string, owner_id: string) {
    const grant = await this.repository.findOne(id, {where: {owner_id}});

    if (!grant) {
      throw new GrantNotFoundException();
    }

    return grant;
  }

  private async avoidExistingSingletonGrant(stream_id, owner_id, recipient_id, scopes: string[]) {
    const maybeExists = await this.repository.find({
      where: {
        stream_id,
        owner_id,
        recipient_id,
        type: GrantType.latest
      }
    });

    if (maybeExists.length) {
      throw new SingletonGrantExists();
    }
  }

  async save(uuid: string, grantData: GrantDto, scopes: string[]) {
    const {stream_id, type} = grantData;

    const isHistorical = (type === GrantType.all || type === GrantType.range);
    if (isHistorical && !scopes.includes(Scopes.status_grants_create_historical)) {
      throw new GrantInvalidTokenScopeException();
    }

    const singletonGrantTypes = [GrantType.all, GrantType.latest]
    if (singletonGrantTypes.includes(type)) {
      if (!scopes.includes(Scopes.status_grants_create_live)) {
        throw new GrantInvalidTokenScopeException();
      }
      await this.avoidExistingSingletonGrant(stream_id, uuid, grantData.recipient_id, scopes);
    }

    const stream = await this.streamService.getById(stream_id, {
      relations: ["streamType"],
    });

    if (!stream || uuid !== stream.owner_id || !stream.streamType.supported_grants.includes(type)) {
      throw new BadRequestException();
    }

    grantData.owner_id = stream.owner_id;

    return this.repository.saveGrant(grantData);
  }

  async getMy(tokenData: TokenData, options: QueryOptions) {
    const grants = await this.find(options) as GrantEntity[];

    return grants.map(grant => {
      if (!tokenData.scopes.includes(Scopes.status_grants_manage)) {
        delete grant.properties;
      }

      return grant;
    });
  }

  getForMe(tokenData: TokenData, options: QueryOptions) {
    return this.find(options);
  }

  async delete(id: string, owner_id: string): Promise<any> {
    const grant = await this.get(id, owner_id);

    try {
      await this.subscribersService.removeFromChannelGroup(grant);
    } catch (e) {
      throw new ChannelGroupRemovalError();
    }

    const {raw} = await this.repository
      .createQueryBuilder()
      .delete()
      .where('id = :id AND owner_id = :owner_id', {id, owner_id})
      .returning('*')
      .execute()

    if (raw.length === 0) {
      throw new GrantNotFoundException();
    }

    return raw[0];
  }

  async modifyRange(id: string, owner_id: string, range: TimeRangeDto): Promise<GrantEntity> {
    const grant = await this.get(id, owner_id);

    if (grant.type !== GrantType.range) {
      throw new GrantOperationNotAllowed();
    }

    grant.fromDate = range.fromDate;
    grant.toDate = range.toDate;

    await this.repository.save(grant);

    return grant;
  }

  checkContinuousRange(grants: GrantEntity[], range: TimeRangeDto): void {
    const sortedGrants = _.sortBy(grants, 'fromDate');
    let continuousRange;

    sortedGrants.forEach(grant => {
      if (!continuousRange){
        continuousRange = {
          fromDate: new Date(grant.fromDate).getTime(),
          toDate: new Date(grant.toDate).getTime()
        }
      }

      const isContinuous = grant.fromDate <= continuousRange.toDate

      if (!isContinuous) {
        throw new Error("Range is not granted");
      }

      if (grant.toDate <= continuousRange.toDate){
        return
      }

      continuousRange.toDate = new Date(grant.toDate).getTime();
    })

    const isContinuousRangeValid = continuousRange.fromDate <= new Date(range.fromDate).getTime() && continuousRange.toDate >= new Date(range.toDate).getTime()

    if (!isContinuousRangeValid) {
      throw new Error("Range is not granted");
    }
  }

  async getByRange (recipient_id: string, stream_id: string, range: TimeRangeDto): Promise<GrantEntity[]> {
    const where = {
      recipient_id: recipient_id,
      stream_id,
      fromDate: LessThanOrEqual(range.toDate),
      toDate: MoreThanOrEqual(range.fromDate),
    }

    return this.repository.find({ where });
  }
}
