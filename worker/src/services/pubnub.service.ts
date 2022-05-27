import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {UpdateWorkerDto} from "../../../src/products/dto/update-worker.dto";
import {PickType} from "@nestjs/mapped-types";
import Pubnub = require("pubnub");

export const CHANNEL_PREFIX = 'grant_';

export class PREMessage extends PickType(UpdateWorkerDto,
  ['id', 'user_id', 'stream_id', 'grant_id', 'recipient_id', 'recorded_at'] as const
) {
  reencrypted_payload: string
};


@Injectable()
export class PubnubService {
  private readonly pubnub: Pubnub;
  private readonly logger = new Logger(PubnubService.name);

  constructor(private readonly configService: ConfigService) {
    this.pubnub = new Pubnub({
      subscribeKey: configService.get('WORKER_SUBSCRIBE_KEY'),
      publishKey: configService.get('WORKER_PUBLISH_KEY'),
      secretKey: configService.get('WORKER_SECRET_KEY'),
      ssl: true,
      uuid: configService.get('WORKER_UUID')
    });

    this.logger.log('pubnub initialized');
  }


  public async publish(grant_id: string, message: PREMessage): Promise<void> {
      await this.pubnub.publish({
        message: message,
        channel: CHANNEL_PREFIX + grant_id,
        sendByPost: false,
        storeInHistory: true
      }).catch(e => {
        this.logger.error(`error while sending pre to pubnub ${e.message}`);
      })
  }

  public async checkListeners(grant_id: string): Promise<any[]> {
    const neededChannel = CHANNEL_PREFIX + grant_id;
    try {
      const response: Pubnub.HereNowResponse = await this.pubnub.hereNow({
        channels : [neededChannel],
        includeUUIDs: true,
        includeState: false
      });
      const channel = response.channels[neededChannel];
      return channel?.occupants;
    } catch (e) {
      this.logger.error(`error on fetch listeners ${e.message}`);
    }
  }
}
