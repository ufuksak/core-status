import * as dotenv from 'dotenv'
dotenv.config()

const RABBITMQ_USER: string = <string>process.env.RABBITMQ_USER
const RABBITMQ_PASSWORD: string = <string>process.env.RABBITMQ_PASSWORD
const RABBITMQ_HOST: string = <string>process.env.RABBITMQ_HOST
const RABBITMQ_PORT: string = <string>process.env.RABBITMQ_PORT

export const RABBIT_CONNECTION_URL: string = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`