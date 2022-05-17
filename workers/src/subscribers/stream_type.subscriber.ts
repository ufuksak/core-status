import { Controller } from '@nestjs/common'
import { MessageHandler } from '@globalid/nest-amqp'
import { UpdateWorkerDto } from '../../../src/products/dto/update-worker.dto';

@Controller()
export class StreamTypeSubscriber {

  @MessageHandler({})
  async handleStreamTypeUpdateEvent(payload: UpdateWorkerDto): Promise<void> {
    console.log("payload: ", payload)
  }
}
