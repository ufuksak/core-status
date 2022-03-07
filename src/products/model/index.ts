import { ServiceNotification } from './notification'
import { MessageService } from '../services/message'
import { BlockService } from '../services/block'
import { Config } from './config'

export * from './channel'
export * from './config'
export * from './message'
export * from './notification'
export * from './response'
export * from './subscription'
export * from './block'

export interface GlobalidMessagingClient {
  getConfig (): Config

  subscribe (callback: (channel: string, notification: ServiceNotification) => void): string

  unsubscribe (token: string): boolean

  message (): MessageService

  block (): BlockService
}
