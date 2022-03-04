import { SetMetadata } from '@nestjs/common'
import { Controller } from '@nestjs/common/interfaces'
import { CallbackMethod, RABBITMQ_SUBSCRIBER, RabbitSubscriberConfig, RabbitSubscriberMetadataConfiguration } from './rabbit.interfaces'

export const RabbitSubscribe = (config: RabbitSubscriberConfig) => {
  return (target: Controller, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    SetMetadata<string, RabbitSubscriberMetadataConfiguration>(RABBITMQ_SUBSCRIBER, {
      queue: config.queue,
      target: target.constructor.name,
      methodName: propertyKey,
      callback: <CallbackMethod<unknown>>descriptor.value,
    })(target, propertyKey, descriptor)
  }
}
