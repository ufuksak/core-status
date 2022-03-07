import {Module} from '@nestjs/common'
import {ChannelController} from "../controllers/channel.controller";
import {ApiService} from "../services/api";

@Module({
  imports: [],
  controllers: [ChannelController],
  providers: [Object, ApiService],
})
export class ChannelModule {}
