import {TokenData} from "@globalid/nest-auth";
import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {GrantDto} from "../dto/grant.model";
import {GrantRepository} from "../repositories/grant.repository";
import {StreamService} from "./stream.service";
import {GrantNotFoundException} from "../exception/response.exception";

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

    async save(tokenData: TokenData, grantData: GrantDto){
      const { stream_id, type } = grantData;

      const stream = await this.streamService.getById(stream_id, {
        relations: ["streamType"],
      });

      if(!stream || tokenData.sub !== stream.owner_id || !stream.streamType.supported_grants.includes(type)){
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
}
