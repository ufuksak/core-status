import {Controller, Logger} from '@nestjs/common'
import {MessageHandler} from '@globalid/nest-amqp'
import {UpdateWorkerDto} from "../../../src/products/dto/update-worker.dto";
import {PubnubService} from "../services/pubnub.service";
import * as cryptosdk from 'globalid-crypto-library/src/index';

type LockboxWithContent = cryptosdk.PRE.LockboxWithContent;
const util = cryptosdk.PRE.util;

@Controller()
export class PreSubscriber {
  private readonly logger = new Logger(PreSubscriber.name);

  constructor(private readonly pubnub: PubnubService) {}

  private static async processPREEvent(payload: string, reEncryptionKey: string): Promise<string> {
    const chunk = JSON.parse(util.bytesToString(util.hexToBytes(payload))) as LockboxWithContent;
    chunk.lockbox = cryptosdk.PRE.reEncrypt(reEncryptionKey, chunk.lockbox);
    return util.bytesToHex(util.stringToBytes(JSON.stringify(chunk)));
  }

  @MessageHandler({})
  async handlePREEvent(update: UpdateWorkerDto): Promise<void> {
    const {grant_id, payload, recipient_id, stream_id, id, user_id, recorded_at, reEncryptionKey} = update;
      const occupants = await this.pubnub.checkListeners(grant_id);

      if(occupants.find(el => el.uuid === recipient_id)) {
        await PreSubscriber.processPREEvent(payload, reEncryptionKey).then((reencrypted_payload: string) =>
          this.pubnub.publish(grant_id, {
            id,
            recipient_id,
            stream_id,
            grant_id,
            user_id,
            recorded_at,
            reencrypted_payload
          })).catch(e => this.logger.error(`error while processing pre event ${e.message}`))
      }
  }
}
