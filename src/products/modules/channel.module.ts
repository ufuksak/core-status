import {Module} from '@nestjs/common'
import {ChannelController} from "../controllers/channel.controller";
import {ApiService} from "../services/api";
import {ChannelPublisher} from "../rabbit/channel.publisher";

@Module({
  imports: [],
  controllers: [ChannelController],
  providers: [ApiService, ChannelPublisher],
})
export class ChannelModule {}
