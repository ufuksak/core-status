import { Controller, Get, Inject, Logger } from '@nestjs/common'
import {QUEUE_NAME} from "../config/config";
import {RabbitService} from "../services/rabbit.service";

@Controller('/api/v1/producer')
export class ProducerController {
  private rabbitService: RabbitService

  constructor(@Inject('RABBIT_SERVICE') rabbitService: RabbitService) {
    this.rabbitService = rabbitService
  }

  @Get()
  triggerEvent(): string {
    const msg = { a: 'test_message' }
    this.rabbitService.publishMessage(QUEUE_NAME, msg)
    Logger.log(`Sending message: ${JSON.stringify(msg)}`, 'TRIGGER_EVENT')

    return `Sent ${JSON.stringify(msg)}`
  }
}
