// tslint:disable:no-reserved-keywords

import { PagingResponse } from './response'
import { Message } from './message'

export enum ChannelType {
  Service = 'SERVICE',
  Presence = 'PRESENCE',
  Personal = 'PERSONAL',
}

export interface ChannelPayload {
  uuid: string
  type: ChannelType
  exposed: boolean
  participants: string[]
  title?: string
  description?: string
  image_url?: string
}

export interface Channel {
  id: string
  uuid: string
  alias: string
  type: ChannelType
  exposed: boolean
  title?: string
  description?: string
  image_url?: string
  deleted: boolean
  created_by: string
  updated_by?: string
  created_at: string
  updated_at?: string
  participants: string[]
  unread_count: number
  message?: Message
}

export interface Channels {
  channels: Channel[]
}

export interface ChannelsResponse extends PagingResponse {
  data: Channels
}

export interface Counter {
  id: string
  unread_count: number
}

export interface Counters {
  counters: Counter[]
}

export interface CountersResponse extends PagingResponse {
  data: Counters
}
