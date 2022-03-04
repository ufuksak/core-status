import { Controller, Logger } from '@nestjs/common'
import { RabbitSubscribe } from 'src/rabbit/rabbit.decorators'
import {QUEUE_NAME, TestEvent} from "../config/config";

@Controller('/api/v1/consumer')
export class ConsumerController {
  @RabbitSubscribe({
    queue: QUEUE_NAME,
  })
  eventHandlerSubscribed(msg: TestEvent): void {
    Logger.log(msg, 'eventHandlerSubscribed')
  }
}
