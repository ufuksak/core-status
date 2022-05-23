import {Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UpdateEntity} from "../entity/update.entity";
import {StatusPublisher} from "../rabbit/status.publisher";
import {StreamRepository} from "../repositories/stream.repository";
import {GrantType} from "../dto/grant.model";
import {GrantEntity} from "../entity/grant.entity";
import {CHANNEL_PREFIX} from "../../../worker/src/services/pubnub.service";
import {
  addChannelsToPubnubChannelGroup, pubnubPublish,
  removeChannelsFromPubnubChannelGroup,
  subscribeToChannel, unsubscribeFromChannel
} from "../pubnub/pubnub";
import {
  ChannelGroupAdditionError,
  ChannelGroupRemovalError,
  PushNotificationSendingError
} from "../exception/response.exception";
import {PubnubNotification} from "../pubnub/notification";

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

  async pushGrantToChannelGroup(notification : PubnubNotification, update: GrantEntity) {
    if(update) {
      const {stream_id} = update;

      const stream = await this.streamRepo.findOne(update.stream_id, {relations: ['grants']});
      if (!stream) {
        this.logger.error(`received update ${update.id} for unknown stream ${stream_id}`)
        return
      }

      const channelName = CHANNEL_PREFIX + update.id;
      try {
        let grantChannelArray = [];
        grantChannelArray.push(channelName);
        const grantChannelGroup = `${stream.type}_${update.recipient_id}`;
        await subscribeToChannel(grantChannelArray);
        await addChannelsToPubnubChannelGroup(grantChannelArray, grantChannelGroup);
      } catch (e) {
        this.logger.error(`error while adding to the channel group ${e.message}`);
        throw new ChannelGroupAdditionError();
      }
      
      try {
        if (update.type === GrantType.latest) {
          await pubnubPublish(channelName, notification);
        }
      } catch (e) {
        this.logger.error(`error while creating push notifications for ${channelName} channel. ${e.message}`);
        throw new PushNotificationSendingError();
      }
    }
  }

  async removeFromChannelGroup(update: GrantEntity) {
    if(update) {
      const {stream_id} = update;

      const stream = await this.streamRepo.findOne(update.stream_id, {relations: ['grants']});
      if (!stream) {
        this.logger.error(`received update ${update.id} for unknown stream ${stream_id}`)
        return
      }

      try {
        let grantChannelArray = [];
        grantChannelArray.push(CHANNEL_PREFIX + update.id);
        const grantChannelGroup = `${stream.type}_${update.recipient_id}`;
        await unsubscribeFromChannel(grantChannelArray);
        await removeChannelsFromPubnubChannelGroup(grantChannelArray, grantChannelGroup);
      } catch (e) {
        this.logger.error(`error while adding to the channel group ${e.message}`);
        throw new ChannelGroupRemovalError();
      }
    }
  }
}
