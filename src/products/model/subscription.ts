import { PagingResponse } from './response'

export interface Subscription {
  channel_id: string
  alias: string
}

export interface Subscriptions {
  channels: Subscription[]
  subscribe_key: string
}

export interface SubscriptionResponse extends PagingResponse {
  data: Subscriptions
}
