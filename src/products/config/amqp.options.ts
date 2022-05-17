import { RABBIT_CONNECTION_URL } from "./rabbit";

export const amqpOptions = {
  urlOrOpts: RABBIT_CONNECTION_URL,
  defaultValidationOptions: {
    classTransform: {enableImplicitConversion: true},
    validate: true,
  },
}