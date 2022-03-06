// tslint:disable:no-duplicate-string

import { SANDBOX } from '../helpers'
import {
  BlockedUser,
  BlocksResponse,
  Channel,
  ChannelPayload,
  ChannelsResponse,
  ChannelType,
  CountersResponse,
  Message, MessageDeliveredResponse,
  MessagePayload, MessageSeenResponse,
  MessagesResponse,
  MessageType, SendMessageResponse, Subscription, SubscriptionResponse
} from '../../src/products/model'

export const axiosInterceptors: object = {
  request: {
    use: SANDBOX.stub(),
    eject: SANDBOX.stub(),
  },
  response: {
    use: SANDBOX.stub(),
    eject: SANDBOX.stub(),
  }
}

export const subscriptionOneMock: Subscription = {
  channel_id: '1',
  alias: 'channel-1',
}

export const subscriptionsMock: SubscriptionResponse = {
  data: {
    channels: [subscriptionOneMock],
    subscribe_key: 'sub-c-252ec7e2-7ca4-11e9-89f1-56e8a30b5f0e',
  },
  meta: {
    page: 1,
    per_page: 20,
    total: 1,
  }
}

export const noSubscriptionsMock: SubscriptionResponse = {
  data: {
    channels: [],
    subscribe_key: 'sub-c-252ec7e2-7ca4-11e9-89f1-56e8a30b5f0e',
  },
  meta: {
    page: 2,
    per_page: 20,
    total: 0,
  }
}

export const userOneMock: string = '62106a8d-3323-49e3-b979-bcd937d427d0'

export const participantsMock: string[] = ['62106a8d-3323-49e3-b979-bcd937d427d0', '071d8e5d-3387-490c-af09-d3cff791fcaf']

export const channelOneMock: Channel = {
  id: '1',
  uuid: '79a45c4f-2885-469c-8f4c-93c251e372a7',
  alias: 'channel-1',
  type: ChannelType.Personal,
  deleted: false,
  exposed: false,
  participants: participantsMock,
  unread_count: 0,
  created_at: new Date().toISOString(),
  created_by: new Date().toISOString(),
}

export const oneChannelMock: ChannelsResponse = {
  data: {
    channels: [channelOneMock]
  },
  meta: {
    page: 1,
    per_page: 20,
    total: 1,
  }
}

export const channelPayloadMock: ChannelPayload = {
  type: ChannelType.Personal,
  uuid: '79a45c4f-2885-469c-8f4c-93c251e372a7',
  exposed: false,
  participants: participantsMock,
}

export const countersMock: CountersResponse = {
  data: {
    counters: [{
      id: '1',
      unread_count: 0,
    }]
  },
  meta: {
    page: 1,
    per_page: 20,
    total: 1,
  }
}

export const messageOneMock: Message = {
  id: '1',
  channel_id: '1',
  sequence_id: 1,
  uuid: '3175a19f-24aa-4ae6-b9b2-d41dcb5db5c2',
  type: MessageType.Text,
  author: 'test',
  content: {},
  deleted: false,
  delivered: false,
  created_at: new Date().toISOString()
}

export const messagePayloadMock: MessagePayload = {
  channels: ['1'],
  message: {
    type: MessageType.Text,
    uuid: '3175a19f-24aa-4ae6-b9b2-d41dcb5db5c2',
    content: '{}'
  },
}

export const messagesMock: MessagesResponse = {
  data: {
    messages: [messageOneMock],
    message_seen: undefined,
  },
  meta: {
    page: 1,
    per_page: 20,
    total: 1,
  }
}

export const sendMessageMock: SendMessageResponse = [messageOneMock]

export const messageDeliveredMock: MessageDeliveredResponse = {
  message_id: '1',
  channel_id: '1',
  user_id: '62106a8d-3323-49e3-b979-bcd937d427d0',
  delivered_at: new Date().toISOString(),
}

export const messageSeenMock: MessageSeenResponse = {
  id: '1',
  message_id: '1',
  channel_id: '1',
  gid_uuid: '62106a8d-3323-49e3-b979-bcd937d427d0',
  seen_at: new Date().toISOString(),
}

export const blockedUserMock: BlockedUser = {
  id: '1',
  user_id: '62106a8d-3323-49e3-b979-bcd937d427d0',
  blocked_by: '071d8e5d-3387-490c-af09-d3cff791fcaf',
  blocked_at: new Date().toISOString(),
}

export const userBlocksMock: BlocksResponse = {
  data: {
    blocked_users: [blockedUserMock],
  },
  meta: {
    page: 1,
    per_page: 20,
    total: 1,
  }
}
