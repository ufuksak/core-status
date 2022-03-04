export const RABBIT_URI = 'amqp://guest:guest@localhost:5672/'
export const EXCHANGE_PRODUCER = 'producer_exchange'
export const EXCHANGE_CONSUMER = 'consumer_exchange'
export const EXCHANGE_RANDOM = 'random_exchange'

export const ROUTING_KEY = 'some_routing_key'
export const ROUTING_KEY_RANDOM = 'random-routing-key'

export const QUEUE_NAME = 'Testing_nest_queue'

export interface TestEvent {
  meta: {
    routingKey: string
    exchange: string
  }
}
