import {AmqpService, PublisherI} from '@globalid/nest-amqp'

import {Controller, Logger} from '@nestjs/common'
import {MessageHandler} from '@globalid/nest-amqp'
import { CacheService } from '../../../src/products/services/cache.service';
import { PreStatusUpdateDto } from '../dto/pre-status-update.dto';
import { StatusUpdateDto } from '../dto/status-update.dto';

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
      const grantIds = await this.cacheService.get(grantsKey) as string[];

      if(!grantIds || grantIds.length === 0){
          this.logger.error(`error there is no grants for stream ${stream_id}`);
          return;
      }

      await Promise.all(grantIds.map(async grant_id => {
        const reEncryptionKeyKey = this.cacheService.builtReEncryptionPerGrantKey(grant_id);
        const reEncryptionKey = await this.cacheService.get(reEncryptionKeyKey) as string;

        if(!reEncryptionKey){
          this.logger.error(`error there is no re-encryption key for grant ${grant_id}`);
          return;
        }

        await this.publishPREStatusUpdate({
          ...update,
          grant_id,
          reEncryptionKey,
        })
      }))

    } catch (error) {
      this.logger.error(`error while processing pre event ${error.message}`)
    }
  }

  private async publishPREStatusUpdate(payload: PreStatusUpdateDto): Promise<void> {
    await this.sender(payload)
  }
}
