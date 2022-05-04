import {CONFIG_VALIDATION_SCHEMA, configuration} from "./config";


export const configOptions = {
  validationSchema: CONFIG_VALIDATION_SCHEMA,
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
  },
  isGlobal: true,
  load: [configuration]
}