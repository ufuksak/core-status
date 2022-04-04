import { SetMetadata } from '@nestjs/common'
import { CallbackMethod, RABBITMQ_SUBSCRIBER, RabbitSubscriberConfig, RabbitSubscriberMetadataConfiguration } from './rabbit.interfaces'

export const RabbitSubscribe = <T, U extends object>(config: RabbitSubscriberConfig<U>) => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    SetMetadata<string, RabbitSubscriberMetadataConfiguration<T, U>>(RABBITMQ_SUBSCRIBER, {
      queue: config.queue,
      options: config.options,
      target: target.constructor.name,
      methodName: propertyKey,
      callback: <CallbackMethod<T>>descriptor.value,
    })(target, propertyKey, descriptor)
  }
}
