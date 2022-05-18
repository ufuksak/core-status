import * as Joi from 'joi'

export const configuration = (): Record<string, unknown> => ({
  serviceName: 'status-service'
});

export const CONFIG_VALIDATION_SCHEMA: Joi.ObjectSchema = Joi.object({
  WORKER_SUBSCRIBE_KEY: Joi.string().required(),
  WORKER_PUBLISH_KEY: Joi.string().required(),
  WORKER_SECRET_KEY: Joi.string().required(),
  WORKER_UUID: Joi.string().required(),
  WORKER_PORT: Joi.number().required()
});
