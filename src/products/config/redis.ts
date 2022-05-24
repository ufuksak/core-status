import * as dotenv from 'dotenv'
dotenv.config()

const REDIS_HOST: string = <string>process.env.REDIS_HOST
const REDIS_PORT: string = <string>process.env.REDIS_PORT

export const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT
}
