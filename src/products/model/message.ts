// tslint:disable:no-reserved-keywords

import { PagingResponse } from './response'

export enum MessageType {
  Text = 'TEXT',
}

export interface SendMessage {
  uuid: string
  type: MessageType
  content: string
}

export interface MessagePayload {
  message: SendMessage
  channels: string[]
}

export interface Message {
  id: string
  uuid: string
  channel_id: string
  sequence_id: number
  type: MessageType
  author: string
  content: object
  delivered: boolean
  deleted: boolean
  created_at: string
  updated_at?: string
}

export interface MessagesWithSeen {
  messages: Message[]
  message_seen?: Message
}

export interface MessagesResponse extends PagingResponse {
  data: MessagesWithSeen
}

export interface SendMessageResponse extends Array<Message> {
}

export interface MessageDeliveredResponse {
  message_id: string
  channel_id: string
  user_id: string
  delivered_at: string
}

export interface MessageSeenResponse {
  id: string
  message_id: string
  channel_id: string
  gid_uuid: string
  seen_at: string
}
