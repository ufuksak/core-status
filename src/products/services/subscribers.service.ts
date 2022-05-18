import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UpdateEntity} from "../entity/update.entity";
import {StatusPublisher} from "../rabbit/status.publisher";
import {StreamRepository} from "../repositories/stream.repository";
import {GrantType} from "../dto/grant.model";
import {StreamHandling} from "../dto/stream_handling.model";

@Injectable()
export class SubscribersService {
  private readonly logger = new Logger(SubscribersService.name);
  constructor(
    @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
    private readonly statusPublisher: StatusPublisher,
  ) {}

  async pushToWorker(update: UpdateEntity) {
    const {stream_id} = update;

    const stream = await this.streamRepo.findOne(stream_id, {relations: ['grants', 'streamType']});
    if(!stream) {
      this.logger.error(`received update ${update.id} for unknown stream ${stream_id}`)
      return
    }

    const {id, recorded_at, payload} = update;

    for(const grant of stream.grants) {
      if(grant.type === GrantType.all || grant.type === GrantType.latest) {
        const {id: grant_id, owner_id: user_id, recipient_id, properties} = grant;
        await this.statusPublisher.publishStatusUpdate({
          id,
          stream_id,
          grant_id,
          user_id,
          recipient_id,
          recorded_at: new Date(recorded_at).toISOString(),
          payload,
          reEncryptionKey: properties.reEncryptionKey
        }).catch(e => this.logger.error(`error while publish updates to rabbit ${e.message}`));
      }
    }
  }
}
