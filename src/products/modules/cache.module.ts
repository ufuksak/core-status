import {Global, Module} from '@nestjs/common'
import { RedisModule } from "@globalid/nest-redis";
import { redisConfig } from "../config/redis";
import { CacheService } from '../services/cache.service';

@Global()
@Module({
    imports: [
      RedisModule.registerAsync(redisConfig),
    ],
    controllers: [],
    providers: [
      CacheService
    ],
    exports: [
      CacheService
    ]
})
export class CacheModule {}
