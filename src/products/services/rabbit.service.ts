import { Injectable } from '@nestjs/common'
import { CallbackMethod, RabbitServiceAccessors } from '../../rabbit/rabbit.interfaces'

@Injectable()
export class RabbitService {
  private accessors: RabbitServiceAccessors
  constructor(accessors: RabbitServiceAccessors) {
    this.accessors = accessors
  }

  publishMessage<T>(queue: string, message: T): boolean {
    return this.accessors.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
  }

  async subscribeMethod<T>(queue: string, method: CallbackMethod<T>): Promise<void> {
    await this.accessors.channel.assertQueue(queue)
    await this.accessors.channel.consume(queue, msg => {
      if (msg !== null) {
        const msgContent = msg.content.toString()

        method(<T>(<unknown>JSON.parse(msgContent)))
        this.accessors.channel.ack(msg)
      }
    })
  }
}
