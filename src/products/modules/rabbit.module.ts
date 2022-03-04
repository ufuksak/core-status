import { DynamicModule, Global, Inject, Module, OnModuleInit } from '@nestjs/common'
import { MetadataScanner } from '@nestjs/core'
import { SubscriberExplorer } from '../../rabbit/rabbit.explorer'
import { RabbitOptions, RabbitSubscriberMetadataConfiguration } from '../../rabbit/rabbit.interfaces'
import { RabbitService } from '../services/rabbit.service'
import { connect } from 'amqplib'

@Global()
@Module({})
export class RabbitModule implements OnModuleInit {
  private rabbitService: RabbitService

  constructor(private readonly explorer: SubscriberExplorer, @Inject('RABBIT_SERVICE') rabbitService: RabbitService) {
    this.rabbitService = rabbitService
  }

  async onModuleInit(): Promise<void> {
    const subscribers: RabbitSubscriberMetadataConfiguration[] = this.explorer.explore()
    for (const subscriber of subscribers) {
      await this.rabbitService.subscribeMethod(subscriber.queue, subscriber.callback)
    }
  }

  static async registerAsync(options: RabbitOptions): Promise<DynamicModule> {
    const connection = await connect(options.url)
    const channel = await connection.createChannel()
    const createdQueues = await Promise.all(options.schema.queues.map(async queue => channel.assertQueue(queue)))

    const rabbitServiceFactory = {
      provide: 'RABBIT_SERVICE',
      useFactory: (): RabbitService => {
        return new RabbitService({
          connection,
          channel,
          createdQueues,
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
