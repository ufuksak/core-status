import { Logger, Injectable } from '@nestjs/common'
import { CallbackMethod, RabbitQueueOptions, RabbitServiceAccessors } from '../../rabbit/rabbit.interfaces'
import { plainToInstance } from 'class-transformer'
import { validateSync, ValidationError } from 'class-validator'
import { Connection, connect, ConsumeMessage, MessagePropertyHeaders, Options } from 'amqplib'
import {
  GLOBAL_DEAD_LETTER_EXCHANGE,
  INITIAL_RETRY_INTERVAL,
  MAX_MESSAGE_RETRY,
  RETRY_EXCHANGE,
  RETRY_EXCHANGE_PREFIX,
  RETRY_FACTOR,
  RETRY_WAIT_ENDED_QUEUE,
  X_DEAD_LETTER_EXCHANGE,
  X_DEAD_LETTER_ROUTING_KEY,
  X_MESSAGE_TTL,
  X_ORIGINAL_EXCHANGE,
  X_ORIGINAL_ROUTING_KEY,
  X_RETRY_COUNT,
} from '../../rabbit/rabbit.constants'

@Injectable()
export class RabbitService {
  private accessors: RabbitServiceAccessors
  private readonly logger = new Logger('RabbitService')

  constructor(accessors: RabbitServiceAccessors) {
    this.accessors = accessors
  }

  static async getStaticInstance(url: string): Promise<RabbitService> {
    const connection = await connect(url)
    const channel = await connection.createChannel()

    return new RabbitService({
      connection,
      channel,
    })
  }

  get connection(): Connection {
    return this.accessors.connection
  }

  async purgeQueues(queue: string | string[]): Promise<void> {
    const queues = Array.isArray(queue) ? queue : [queue]
    await Promise.all(
      queues.map(async q => {
        return this.accessors.channel.purgeQueue(q)
      })
    )
  }

  publishMessageToQueue<T>(queue: string, message: T): boolean {
    return this.accessors.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {})
  }

  publishMessage<T>(exchange: string, routingKey: string, message: T, options?: Options.Publish): boolean {
    return this.accessors.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), options)
  }

  async assertGlobalRetrySetup(): Promise<void> {
    const channel = this.accessors.channel

    await channel.assertExchange(RETRY_EXCHANGE, 'direct')
    await channel.assertQueue(RETRY_WAIT_ENDED_QUEUE)
    await channel.bindQueue(RETRY_WAIT_ENDED_QUEUE, RETRY_EXCHANGE, RETRY_WAIT_ENDED_QUEUE)

    await Promise.all(
      Array(MAX_MESSAGE_RETRY)
        .fill('')
        .map(async (_, idx) => {
          const retryQueueName = `${RETRY_EXCHANGE_PREFIX}-${idx}`
          await channel.assertQueue(retryQueueName, {
            messageTtl: this.getTtl(idx),
            deadLetterExchange: RETRY_EXCHANGE,
            deadLetterRoutingKey: RETRY_WAIT_ENDED_QUEUE,
            durable: false,
            exclusive: false,
            autoDelete: true,
          })
          await channel.bindQueue(retryQueueName, RETRY_EXCHANGE, retryQueueName)
        })
    )

    await channel.consume(RETRY_WAIT_ENDED_QUEUE, msg => {
      if (msg !== null) {
        const { routingKey, exchange } = this.getOriginHeaders(msg)
        this.accessors.channel.ack(msg)
        this.accessors.channel.publish(exchange, routingKey, msg.content, { headers: msg.properties.headers })
      }
    })
  }

  async subscribeMethod<T, U extends object>(queue: string, options: RabbitQueueOptions<U> = { silent: false }, method: CallbackMethod<T>): Promise<void> {
    await this.accessors.channel.assertQueue(queue, {
      deadLetterExchange: GLOBAL_DEAD_LETTER_EXCHANGE,
      deadLetterRoutingKey: `dead.${queue}`,
    })

    await this.accessors.channel.consume(queue, msg => {
      if (msg !== null) {
        const msgContent = msg.content.toString()

        if (options.silent === false) {
          this.logger.log(`Received message on queue ${queue}: ${msgContent}`)
        }

        try {
          const message: T = <T>JSON.parse(msgContent)

          if (options.schema) {
            const validationErrors: ValidationError[] = validateSync(plainToInstance(options.schema, message))

            if (validationErrors.length > 0) {
              this.logger.error(validationErrors)

              return this.accessors.channel.ack(msg)
            }
          }

          // eslint-disable-next-line no-void
          void method(message).then((ack: boolean): void => {
            if (ack) {
              return this.accessors.channel.ack(msg)
            } else {
              return this.handleProcessingFailed(msg)
            }
          })
        } catch (error) {
          this.logger.error(`Failed message on queue: ${msg}`)
          return this.handleProcessingFailed(msg)
        }
      }
    })
  }

  private handleProcessingFailed(message: ConsumeMessage): void {
    const retryCount = this.getRetryCount(message)
    if (retryCount >= MAX_MESSAGE_RETRY) {
      this.accessors.channel.nack(message, false, false)
    } else {
      this.accessors.channel.ack(message)
      this.enqueueWithBackoff(message)
    }
  }

  private enqueueWithBackoff(message: ConsumeMessage): void {
    this.setOriginHeaders(message)
    const retryCount = this.getRetryCount(message)

    this.incrementRetryCount(message, retryCount)
    this.setRequeueDeclarationParams(message, this.getTtl(retryCount))

    const retryQueueName = `${RETRY_EXCHANGE_PREFIX}-${retryCount}`
    this.accessors.channel.publish(RETRY_EXCHANGE, retryQueueName, message.content, { headers: message.properties.headers })
  }

  private getTtl(retryCount: number): number {
    return Math.round(INITIAL_RETRY_INTERVAL + INITIAL_RETRY_INTERVAL * retryCount * RETRY_FACTOR)
  }

  private getOriginHeaders(message: ConsumeMessage): { exchange: string; routingKey: string } {
    const headers: MessagePropertyHeaders = message.properties.headers

    const exchange = <string | undefined>headers[X_ORIGINAL_EXCHANGE]
    const routingKey = <string | undefined>headers[X_ORIGINAL_ROUTING_KEY]

    if (exchange === undefined || routingKey === undefined) {
      throw new Error('Original routing key and exchange not found.')
    }

    return {
      exchange,
      routingKey,
    }
  }

  private setOriginHeaders(message: ConsumeMessage): void {
    message.properties.headers[X_ORIGINAL_EXCHANGE] = message.fields.exchange
    message.properties.headers[X_ORIGINAL_ROUTING_KEY] = message.fields.routingKey
  }

  private setRequeueDeclarationParams(message: ConsumeMessage, ttl: number): void {
    message.properties.headers[X_MESSAGE_TTL] = ttl
    message.properties.headers[X_DEAD_LETTER_ROUTING_KEY] = RETRY_WAIT_ENDED_QUEUE
    message.properties.headers[X_DEAD_LETTER_EXCHANGE] = RETRY_EXCHANGE
  }

  private getRetryCount(message: ConsumeMessage): number {
    const headers = message.properties.headers

    return parseInt(<string>(headers[X_RETRY_COUNT] ?? '0'))
  }

  private incrementRetryCount(message: ConsumeMessage, retryCount: number): number {
    const newCount = retryCount + 1
    message.properties.headers[X_RETRY_COUNT] = newCount

    return newCount
  }
}
