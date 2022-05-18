import * as Joi from 'joi'

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


export const CONFIG_VALIDATION_SCHEMA: Joi.ObjectSchema = Joi.object({
  RABBITMQ_USER: Joi.string().required(),
  RABBITMQ_PASSWORD: Joi.string().required(),
  RABBITMQ_HOST: Joi.string().required(),
  RABBITMQ_PORT: Joi.number().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  CRDB_DB_HOST: Joi.string().required(),
  CRDB_DB_PORT: Joi.string().required(),
  CRDB_DB_USERNAME: Joi.string().required(),
  CRDB_DB_PASSWORD: Joi.string().required(),
  CRDB_DB_DATABASE: Joi.string().required(),
  POSTGRESQL_COMPAT: Joi.bool().required(),
  POSTGRES_DB_HOST: Joi.string().required(),
  POSTGRES_DB_PORT: Joi.string().required(),
  POSTGRES_DB_USERNAME: Joi.string().required(),
  POSTGRES_DB_PASSWORD: Joi.string().required(),
  POSTGRES_DB_DATABASE: Joi.string().required(),
  CORE_STATUS_PORT: Joi.number().required()
});

export const configuration = (): Record<string, unknown> => ({
  serviceName: 'status-service'
});