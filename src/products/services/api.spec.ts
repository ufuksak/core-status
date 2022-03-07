// tslint:disable:no-big-function
// tslint:disable:no-commented-code
// tslint:disable:no-duplicate-imports
// tslint:disable:max-func-body-length

import { expect } from '../../../test/unit/setup'
import { resetStubs, SANDBOX, SinonModuleStub, stubModule } from '../../../test/helpers'
import {
  BlockedUser,
  BlocksResponse,
  Channel,
  ChannelsResponse,
  CountersResponse,
  MessageDeliveredResponse,
  MessageSeenResponse,
  MessagesResponse,
  SendMessageResponse,
  SubscriptionResponse,
} from '../model'
import * as mocks from '../../../test/unit/mock'
import { ApiService } from './api'
import axios, { AxiosInstance } from 'axios'

describe('API Service', () => {
  let service: ApiService
  let axiosStub: SinonModuleStub<AxiosInstance>

  beforeEach(() => {
    resetStubs()

    axiosStub = stubModule(axios, ['defaults', 'interceptors'])

    // tslint:disable-next-line:no-any
    SANDBOX.stub(axios, 'create').returns(<any> {
      interceptors: mocks.axiosInterceptors,
      ...axiosStub,
    })

    service = new ApiService({ accessToken: 'test' })
  })

  describe('#getSubscriptions', () => {
    it('should get subscriptions for the user', async () => {
      axiosStub.get.resolves(mocks.subscriptionsMock)

      const response: SubscriptionResponse = await service.getSubscriptions(1)

      expect(axiosStub.get).to.be.calledWith('/subscriptions', {
        params: {
          page: 1
        }
      })
      expect(response).to.deep.equal(mocks.subscriptionsMock.data)
    })
  })

  describe('#getChannels', () => {
    it('should get channels for the user', async () => {
      axiosStub.get.resolves({ data: mocks.oneChannelMock })

      const response: ChannelsResponse = await service.getChannels(1, 20)

      expect(axiosStub.get).to.be.calledWith('/channels', {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.oneChannelMock)
    })

    it('should get channels for the user without page size', async () => {
      axiosStub.get.resolves({ data: mocks.oneChannelMock })

      const response: ChannelsResponse = await service.getChannels(1)

      expect(axiosStub.get).to.be.calledWith('/channels', {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.oneChannelMock)
    })

    it('should get channels for the user with default page', async () => {
      axiosStub.get.resolves({ data: mocks.oneChannelMock })

      const response: ChannelsResponse = await service.getChannels()

      expect(axiosStub.get).to.be.calledWith('/channels', {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.oneChannelMock)
    })
  })

  describe('#searchChannels', () => {
    it('should search channels by participants', async () => {
      axiosStub.post.resolves({ data: mocks.oneChannelMock })

      const response: ChannelsResponse = await service.searchChannels(mocks.participantsMock)

      expect(axiosStub.post).to.be.calledWith('/channels/search', { participants: mocks.participantsMock })
      expect(response).to.deep.equal(mocks.oneChannelMock)
    })
  })

  describe('#createChannel', () => {
    it('should create channel', async () => {
      axiosStub.post.resolves({ data: mocks.channelOneMock })

      const response: Channel = await service.createChannel(mocks.channelPayloadMock)

      expect(axiosStub.post).to.be.calledWith('/channels', mocks.channelPayloadMock)
      expect(response).to.deep.equal(mocks.channelOneMock)
    })
  })

  describe('#getCounters', () => {
    it('should get counters for the user', async () => {
      axiosStub.get.resolves({ data: mocks.countersMock })

      const response: CountersResponse = await service.getCounters(1, 20)

      expect(axiosStub.get).to.be.calledWith('/counters', {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.countersMock)
    })

    it('should get counters for the user without page size', async () => {
      axiosStub.get.resolves({ data: mocks.countersMock })

      const response: CountersResponse = await service.getCounters(1)

      expect(axiosStub.get).to.be.calledWith('/counters', {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.countersMock)
    })

    it('should get counters for the user with default page', async () => {
      axiosStub.get.resolves({ data: mocks.countersMock })

      const response: CountersResponse = await service.getCounters()

      expect(axiosStub.get).to.be.calledWith('/counters', {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.countersMock)
    })
  })

  describe('#getMessages', () => {
    it('should get messages for the channel', async () => {
      axiosStub.get.resolves({ data: mocks.messagesMock })

      const response: MessagesResponse = await service.getMessages('1', 1, 20)

      expect(axiosStub.get).to.be.calledWith(`/channels/1/messages`, {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.messagesMock)
    })

    it('should get messages for the channel without page size', async () => {
      axiosStub.get.resolves({ data: mocks.messagesMock })

      const response: MessagesResponse = await service.getMessages('1', 1)

      expect(axiosStub.get).to.be.calledWith(`/channels/1/messages`, {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.messagesMock)
    })

    it('should get messages for the channel with default page', async () => {
      axiosStub.get.resolves({ data: mocks.messagesMock })

      const response: MessagesResponse = await service.getMessages('1')

      expect(axiosStub.get).to.be.calledWith(`/channels/1/messages`, {
        params: {
          page: 1,
          per_page: 20,
        }
      })
      expect(response).to.deep.equal(mocks.messagesMock)
    })
  })

  describe('#sendMessage', () => {
    it('should send message to the channel', async () => {
      axiosStub.post.resolves({ data: mocks.sendMessageMock })

      const response: SendMessageResponse = await service.sendMessage(mocks.messagePayloadMock)

      expect(axiosStub.post).to.be.calledWith('/messages', mocks.messagePayloadMock)
      expect(response).to.deep.equal(mocks.sendMessageMock)
    })
  })

  describe('#setMessageDelivered', () => {
    it('should set message status as delivered', async () => {
      axiosStub.put.resolves({ data: mocks.messageDeliveredMock })

      const response: MessageDeliveredResponse = await service.setMessageDelivered('1')

      expect(axiosStub.put).to.be.calledWith(`/messages/1/delivered`)
      expect(response).to.deep.equal(mocks.messageDeliveredMock)
    })
  })

  describe('#setMessageSeen', () => {
    it('should set message status as seen', async () => {
      axiosStub.put.resolves({ data: mocks.messageSeenMock })

      const response: MessageSeenResponse = await service.setMessageSeen('1')

      expect(axiosStub.put).to.be.calledWith(`/messages/1/seen`)
      expect(response).to.deep.equal(mocks.messageSeenMock)
    })
  })

  describe('#getUserBlocks', () => {
    it('should get user blocks', async () => {
      axiosStub.get.resolves({ data: mocks.userBlocksMock })

      const response: BlocksResponse = await service.getUserBlocks()

      expect(axiosStub.get).to.be.calledWith(`/messaging/blocked-users`)
      expect(response).to.deep.equal(mocks.userBlocksMock)
    })
  })

  describe('#getBlockedUser', () => {
    it('should get block for user', async () => {
      axiosStub.get.resolves({ data: mocks.blockedUserMock })

      const response: BlockedUser = await service.getBlockedUser(mocks.userOneMock)

      expect(axiosStub.get).to.be.calledWith(`/messaging/blocked-users/${mocks.userOneMock}`)
      expect(response).to.deep.equal(mocks.blockedUserMock)
    })
  })

  describe('#blockUser', () => {
    it('should block the user', async () => {
      axiosStub.put.resolves({ data: mocks.blockedUserMock })

      const response: BlockedUser = await service.blockUser(mocks.userOneMock)

      expect(axiosStub.put).to.be.calledWith(`/messaging/blocked-users/${mocks.userOneMock}`)
      expect(response).to.deep.equal(mocks.blockedUserMock)
    })
  })

  describe('#unblockUser', () => {
    it('should unblock the user', async () => {
      axiosStub.delete.resolves({})

      await service.unblockUser(mocks.userOneMock)

      expect(axiosStub.delete).to.be.calledWith(`/messaging/blocked-users/${mocks.userOneMock}`)
    })
  })

})
