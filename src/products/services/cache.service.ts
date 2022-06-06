import {
  Injectable
} from "@nestjs/common";

import { RedisService } from "@globalid/nest-redis";
import { KeyType, ValueType } from "ioredis";

@Injectable()
export class CacheService {

  constructor(
    private readonly redisService: RedisService,
  ) {}

  buildStatusUpdateKey(recipient_id: string, stream_id: string, update_id: string): string {
    return `status-update:${recipient_id}:${stream_id}:${update_id}`;
  }

  builtGrantsPerStreamKey(stream_id: string): string {
    return `stream-grants:${stream_id}`;
  }

  builtReEncryptionPerGrantKey(grant_id: string): string {
    return `grant-reencryption-key:${grant_id}`;
  }

  async get(key: KeyType): Promise<ValueType> {
    const value = await this.redisService.connection.get(key)

    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  async set(key: KeyType, value: ValueType) {
    // convert value to json string if possible
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    await this.redisService.connection.set(key, value)
  }

}
