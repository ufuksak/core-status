import {Controller, Logger} from '@nestjs/common'
import {MessageHandler} from '@globalid/nest-amqp'
import {UpdateWorkerDto} from "../../../src/products/dto/update-worker.dto";
import {PubnubService} from "../services/pubnub.service";
import { reEncryptPayload } from "../../../src/products/util/pre";
import { CacheService } from '../../../src/products/services/cache.service';

@Controller()
export class PreSubscriber {
  private readonly logger = new Logger(PreSubscriber.name);

  constructor(
    private readonly pubnub: PubnubService,
    private readonly cacheService: CacheService
  ) {}

  @MessageHandler({})
  async handlePREEvent(update: UpdateWorkerDto): Promise<void> {
    const {grant_id, payload, recipient_id, stream_id, id, user_id, recorded_at, reEncryptionKey} = update;
      const occupants = await this.pubnub.checkListeners(grant_id);

      const isRecipientListening = occupants.some(occupant => occupant.uuid === recipient_id);

      if(!isRecipientListening){
        return
      }

      try {
        const reencrypted_payload = reEncryptPayload(payload, reEncryptionKey)

        const key = this.cacheService.buildStatusUpdateKey(recipient_id, stream_id, id)

        await this.cacheService.set(key, reencrypted_payload)

        await this.pubnub.publish(grant_id, {
          id,
          recipient_id,
          stream_id,
          grant_id,
          user_id,
          recorded_at,
          reencrypted_payload
        })

      } catch (error) {
        this.logger.error(`error while processing pre event ${error.message}`)
      }

  }
}
