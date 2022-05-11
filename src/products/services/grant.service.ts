import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {GrantDto, GrantType, ModifyGrantRangeDto} from "../dto/grant.model";
import {GrantRepository} from "../repositories/grant.repository";
import {StreamService} from "./stream.service";
import {GrantEntity} from "../entity/grant.entity";
import {Scopes} from "../util/util";
import {
  GrantInvalidTokenScopeException,
  GrantNotFoundException,
  GrantOperationNotAllowed,
  SingletonGrantExists
} from "../exception/response.exception";

@Injectable()
export class GrantService {

    constructor(
      @InjectRepository(GrantRepository) private readonly grantRepo: GrantRepository,
      private streamService: StreamService,
    ) {}

    async get(id: string, owner_id: string) {
      const grant = await this.grantRepo.findOne(id, {where: {owner_id}});

      if(!grant) {
        throw new GrantNotFoundException();
      }

      return grant;
    }

    private async avoidExistingSignletonGrant(stream_id, owner_id, recipient_id, scopes: string[]) {
      const maybeExists = await this.grantRepo.find({
        where: {
          stream_id,
          owner_id,
          recipient_id,
          type: GrantType.latest
        }
      });

      if(maybeExists.length) {
        throw new SingletonGrantExists();
      }
    }

    async save(uuid: string, grantData: GrantDto, scopes: string[]){
      const { stream_id, type } = grantData;

      if(type === GrantType.all || type === GrantType.range) {
        if(!scopes.includes(Scopes.status_grants_create_historical)) {
          throw new GrantInvalidTokenScopeException();
        }
      }
      const singletonGrantTypes = [GrantType.all, GrantType.latest]
      if(singletonGrantTypes.includes(type)) {
        if(!scopes.includes(Scopes.status_grants_create_live)) {
          throw new GrantInvalidTokenScopeException();
        }
        await this.avoidExistingSignletonGrant(stream_id, uuid, grantData.recipient_id, scopes);
      }

      const stream = await this.streamService.getById(stream_id, {
        relations: ["streamType"],
      });

      if(!stream || uuid !== stream.owner_id || !stream.streamType.supported_grants.includes(type)){
        throw new BadRequestException();
      }

      grantData.owner_id = stream.owner_id;

      return this.grantRepo.saveGrant(grantData);
    }

    async delete(id: string, owner_id: string) : Promise<any> {
      const {raw} = await this.grantRepo
        .createQueryBuilder()
        .delete()
        .where('id = :id AND owner_id = :owner_id', {id, owner_id})
        .returning('*')
        .execute()

      if(raw.length === 0) {
        throw new GrantNotFoundException();
      }
      return raw[0];
    }

    async modifyRange(id: string, owner_id: string, range: ModifyGrantRangeDto): Promise<GrantEntity> {
      const grant = await this.get(id, owner_id);

      if(grant.type !== GrantType.range) {
        throw new GrantOperationNotAllowed();
      }

      grant.fromDate = range.fromDate;
      grant.toDate = range.toDate;

      await this.grantRepo.save(grant);

      return grant;
    }

}
