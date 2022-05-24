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

  get(key: KeyType): Promise<string> {
    return this.redisService.connection.get(key)
  }

  set(key: KeyType, value: ValueType): Promise<string> {
    return this.redisService.connection.set(key, value)
  }

}
