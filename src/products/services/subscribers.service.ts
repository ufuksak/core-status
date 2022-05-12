import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UpdateEntity} from "../entity/update.entity";
import {StatusPublisher} from "../rabbit/status.publisher";
import {StreamRepository} from "../repositories/stream.repository";
import {GrantType} from "../dto/grant.model";

@Injectable()
export class SubscribersService {
  private readonly logger = new Logger(SubscribersService.name);
  constructor(
    @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
    private readonly statusPublisher: StatusPublisher,
  ) {}

  async pushToWorker(update: UpdateEntity) {
    const {stream_id} = update;

    const stream = await this.streamRepo.findOne(update.stream_id, {relations: ['grants']});
    if(!stream) {
      this.logger.error(`received update ${update.id} for unknown stream ${stream_id}`)
      return
    }

    const fullOrLiveGrants = stream.grants.filter(el => (el.type === GrantType.all) || el.type === GrantType.latest );
    if(fullOrLiveGrants.length) {
      try {
        await this.statusPublisher.publishStatusUpdate({
          update,
          grants: fullOrLiveGrants
        });
      } catch (e) {
        this.logger.error(`error while publish updates to rabbit ${e.message}`);
      }
    }
  }
}
