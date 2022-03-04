import { Channel, Connection, ConsumeMessage, Replies } from 'amqplib'

export const RABBITMQ_SUBSCRIBER = 'rabbit_mq_handler_meta'
export interface RabbitOptions {
  url: string
  schema: {
    queues: [string]
  }
}

export interface RabbitServiceAccessors {
  connection: Connection
  channel: Channel
  createdQueues: Replies.AssertQueue[]
}

export interface RabbitSubscriberConfig {
  queue: string
}

export type CallbackMethod<T> = (msg: T) => void

export class RabbitSubscriberMetadataConfiguration {
  queue!: string
  target!: string
  methodName!: string | symbol
  callback!: CallbackMethod<unknown>
}
