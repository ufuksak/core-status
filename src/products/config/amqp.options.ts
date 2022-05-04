import {RABBIT_URI} from "./config";

export const amqpOptions = {
  urlOrOpts: RABBIT_URI,
  defaultValidationOptions: {
    classTransform: {enableImplicitConversion: true},
    validate: true,
  },
}