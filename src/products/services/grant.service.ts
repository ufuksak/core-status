import { TokenData } from "@globalid/nest-auth";
import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { GrantDto } from "../dto/grant.model";
import { GrantRepository } from "../repositories/grant.repository";
import { StreamService } from "./stream.service";

@Injectable()
export class GrantService {

    constructor(
      @InjectRepository(GrantRepository) private readonly grantRepo: GrantRepository,
      private streamService: StreamService,
    ) {}

    async save(tokenData: TokenData, grantData: GrantDto): Promise<string> {
      const { stream_id, type } = grantData;

      const stream = await this.streamService.getById(stream_id, {
        relations: ["type"],
      });

      if(!stream || tokenData.client_id !== stream.owner_id || !stream.type.supported_grants.includes(type)){
        throw new BadRequestException();
      }

      grantData.owner_id = stream.owner_id;

      const grant = await this.grantRepo.saveGrant(grantData);

      return grant.id;
    }

}
