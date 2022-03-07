import { ApiService } from './api'
import {
  MessageDeliveredResponse,
  MessagePayload,
  MessageSeenResponse,
  MessagesResponse,
  SendMessageResponse,
} from '../model'

export class MessageService {

  private apiService: ApiService

  constructor (apiService: ApiService) {
    this.apiService = apiService
  }

  public async getMessages (channelId: string, page: number = 1, perPage: number = 20): Promise<MessagesResponse> {
    return this.apiService.getMessages(channelId, page, perPage)
  }

  public async sendMessage (messagePayload: MessagePayload): Promise<SendMessageResponse> {
    return this.apiService.sendMessage(messagePayload)
  }

  public async setMessageDelivered (messageId: string): Promise<MessageDeliveredResponse> {
    return this.apiService.setMessageDelivered(messageId)
  }

  public async setMessageSeen (messageId: string): Promise<MessageSeenResponse> {
    return this.apiService.setMessageSeen(messageId)
  }

}
