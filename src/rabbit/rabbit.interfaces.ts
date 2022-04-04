import { Channel, Connection } from 'amqplib'
import { ClassConstructor } from 'class-transformer'

export const RABBITMQ_SUBSCRIBER = 'rabbit_mq_handler_meta'
export interface RabbitOptions {
  url: string
  exchanges: {
    name: string
    type: 'fanout' | 'direct' | 'topic'
    queueBindings: {
      name: string
      bindingKey?: string
      deadLetterExchange?: string
    }[]
  }[]
}

export interface RabbitServiceAccessors {
  connection: Connection
  channel: Channel
}

export interface RabbitQueueOptions<T extends object> {
  silent?: boolean
  schema?: ClassConstructor<T>
}
export interface RabbitSubscriberConfig<T extends object> {
  queue: string
  options?: RabbitQueueOptions<T>
}

export type CallbackMethod<T> = (msg: T) => Promise<boolean>

export class RabbitSubscriberMetadataConfiguration<T, U extends object> {
  queue!: string
  options?: RabbitQueueOptions<U>
  target!: string
  methodName!: string | symbol
  callback!: CallbackMethod<T>
}
export class RabbitSubscriberMetadata<T, U extends object> extends RabbitSubscriberMetadataConfiguration<T, U> {
  classInstance!: Record<string, unknown>
}
