import { DynamicModule, Global, Inject, Logger, Module, OnModuleInit } from '@nestjs/common'
import { MetadataScanner } from '@nestjs/core'
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator'
import { SubscriberExplorer } from '../../rabbit/rabbit.explorer'
import { RabbitOptions, RabbitSubscriberMetadata } from '../../rabbit/rabbit.interfaces'
import { RabbitService } from '../services/rabbit.service'
import { Channel, connect } from 'amqplib'
import { GLOBAL_DEAD_LETTER_EXCHANGE } from '../../rabbit/rabbit.constants'

@Global()
@Module({})
export class RabbitModule implements OnModuleInit {
  private readonly logger = new Logger('RabbitModule')
  private rabbitService: RabbitService

  constructor(
    private readonly explorer: SubscriberExplorer,
    private readonly externalContextCreator: ExternalContextCreator,
    @Inject('RABBIT_SERVICE') rabbitService: RabbitService
  ) {
    this.rabbitService = rabbitService
  }

  async onModuleInit(): Promise<void> {
    await this.rabbitService.assertGlobalRetrySetup()

    const subscribers: RabbitSubscriberMetadata<unknown, object>[] = this.explorer.explore()

    await Promise.all(
      subscribers.map(async subscriber => {
        const handler = this.externalContextCreator.create(subscriber.classInstance, subscriber.callback, <string>subscriber.methodName)

        return this.rabbitService.subscribeMethod(subscriber.queue, subscriber.options, handler)
      })
    )
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing RabbitMQ connection.')
    await this.rabbitService.connection.close()
  }

  private static async assertGlobalDeadLetterExchange(channel: Channel): Promise<void> {
    await channel.assertExchange(GLOBAL_DEAD_LETTER_EXCHANGE, 'topic')
  }

  static async registerAsync(options: RabbitOptions): Promise<DynamicModule> {
    const connection = await connect(options.url)
    const channel = await connection.createChannel()

    await RabbitModule.assertGlobalDeadLetterExchange(channel)

    await Promise.all(
      options.exchanges.map(async exchange => {
        await channel.assertExchange(exchange.name, exchange.type)
        await Promise.all(
          exchange.queueBindings.map(async queue => {
            const pattern = queue.bindingKey ?? queue.name
            await channel.assertQueue(queue.name, {
              deadLetterExchange: queue.deadLetterExchange ?? GLOBAL_DEAD_LETTER_EXCHANGE,
              deadLetterRoutingKey: `dead.${queue.name}`,
            })
            await channel.bindQueue(queue.name, exchange.name, pattern)
          })
        )
      })
    )

    const rabbitServiceFactory = {
      provide: 'RABBIT_SERVICE',
      useFactory: (): RabbitService => {
        return new RabbitService({
          connection,
          channel,
        })
      },
      inject: [],
    }

    return {
      module: RabbitModule,
      imports: [],
      providers: [rabbitServiceFactory, MetadataScanner, SubscriberExplorer],
      exports: ['RABBIT_SERVICE'],
    }
  }
}
