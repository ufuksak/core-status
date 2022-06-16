import {AmqpService, MessageHandler, PublisherI} from '@globalid/nest-amqp'

import {Controller, Logger} from '@nestjs/common'
import {CacheService} from '../../../src/products/services/cache.service';
import {PreStatusUpdateDto} from '../dto/pre-status-update.dto';
import {StatusUpdateDto} from '../dto/status-update.dto';
import {GrantEntity} from "../../../src/products/entity/grant.entity";

@Controller()
export class GrantSubscriber {
  private readonly logger = new Logger(GrantSubscriber.name);
  private readonly sender: PublisherI<PreStatusUpdateDto>

  constructor(
    private readonly cacheService: CacheService,
    private amqpService: AmqpService,
  ) {
    this.sender = this.amqpService.getPublisher(PreStatusUpdateDto)
  }

  @MessageHandler({})
  async handleStatusUpdateEvent(update: StatusUpdateDto): Promise<void> {
    const { stream_id } = update;

    try {
      const grantsKey = this.cacheService.builtGrantsPerStreamKey(stream_id);
      const grants = await this.cacheService.smembers(grantsKey) as GrantEntity[];

      if(!grants || grants.length === 0){
          this.logger.error(`error there is no grants for stream ${stream_id}`);
          return;
      }

      await Promise.allSettled(grants.map(async grant => {
        try {
          const { id: grant_id, recipient_id } = grant;
          const reEncryptionKeyKey = this.cacheService.builtReEncryptionPerGrantKey(grant_id);
          const reEncryptionKey = await this.cacheService.get(reEncryptionKeyKey) as string;

          if(!reEncryptionKey){
            this.logger.error(`error there is no re-encryption key for grant ${grant_id}`);
            return;
          }

          await this.publishPREStatusUpdate(grant_id, reEncryptionKey, {
            ...update,
            recipient_id,
            reEncryptionKey,
            grant_id
          })
        } catch (e) {
          this.logger.error(`error while processing pre event ${e.message}`);
        }
      }))

    } catch (e) {
      this.logger.error(`error while processing pre event ${e.message}`);
    }
  }

  private async publishPREStatusUpdate(routingKey: string, headers: any, payload: PreStatusUpdateDto): Promise<void> {
    await this.sender(payload, {
      routingKey,
      amqpOpts: {
        headers
      }
    });
  }
}
