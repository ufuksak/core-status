import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { NoAccessTokenError } from '../error/authorization'
import { isEmpty } from '../util/validation'
import {
  API_URL,
  IS_DEBUG,
  Config,
  MessageDeliveredResponse,
  MessagePayload,
  MessageSeenResponse,
  MessagesResponse,
  SendMessageResponse,
  SubscriptionResponse,
  Channel,
  ChannelPayload,
  ChannelsResponse,
  CountersResponse,
  BlocksResponse,
  BlockedUser,
} from '../model'
import {Injectable} from "@nestjs/common";

@Injectable()
export class ApiService {

  private static AUTHORIZATION_HEADER: string = 'Authorization'
  private static TOKEN_HEADER: string = 'x-token-data'

  private readonly client: AxiosInstance

  constructor (config: Config) {
    this.client = ApiService.createHttpClient(config.accessToken)
  }

  // tslint:disable-next-line:no-any
  private static getResponseData<T = any> (response: AxiosResponse<T>): T {
    return response.data
  }

  private static createHttpClient (accessToken: string): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: API_URL
    }

    const instance: AxiosInstance = axios.create(config)
    instance.interceptors.request.use(ApiService.createInterceptor(accessToken), ApiService.createErrorHandler)

    return instance
  }

  // istanbul ignore next
  // Is not executed with mocked axios instance
  private static createInterceptor (
    accessToken: string
  ): (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig> {
    return (request: AxiosRequestConfig): Promise<AxiosRequestConfig> | AxiosRequestConfig => {
      if (IS_DEBUG) {
        // tslint:disable-next-line:no-unsafe-any
        request.headers[ApiService.TOKEN_HEADER] = JSON.stringify({
          globalid: process.env.TEST_USER_GLOBALID,
          uuid: process.env.TEST_USER_UUID,
          client_id: '72eed7a4-a949-4305-bf1b-4d695bdfa817',
          grant_type: 'refresh_token',
          rnd: 'test'
        })

        return request
      }

      if (isEmpty(accessToken)) {
        return Promise.reject(new NoAccessTokenError())
      }

      // tslint:disable-next-line:no-unsafe-any
      request.headers[ApiService.AUTHORIZATION_HEADER] = `Bearer ${accessToken}`

      return request
    }
  }

  // istanbul ignore next
  private static createErrorHandler (): Function {
    return (error: AxiosError): void => {
      // tslint:disable-next-line:no-console
      console.error(error)
      throw error
    }
  }

  public async getSubscriptions (page: number): Promise<SubscriptionResponse> {
    return ApiService.getResponseData(await this.client.get<SubscriptionResponse>('/subscriptions', {
      params: {
        page: page
      }
    }))
  }

  public async getChannels (page: number = 1, perPage: number = 20): Promise<ChannelsResponse> {
    return ApiService.getResponseData(await this.client.get<ChannelsResponse>('/channels', {
      params: {
        page: page,
        per_page: perPage,
      }
    }))
  }

  public async searchChannels (participants: string[]): Promise<ChannelsResponse> {
    return ApiService.getResponseData(await this.client.post<ChannelsResponse>('/channels/search', { participants }))
  }

  public async createChannel (channelPayload: ChannelPayload): Promise<Channel> {
    return ApiService.getResponseData(await this.client.post<Channel>('/channels', channelPayload))
  }

  public async getMessages (channelId: string, page: number = 1, perPage: number = 20): Promise<MessagesResponse> {
    return ApiService.getResponseData(await this.client.get<MessagesResponse>(`/channels/${channelId}/messages`, {
      params: {
        page: page,
        per_page: perPage,
      }
    }))
  }

  public async sendMessage (messagePayload: MessagePayload): Promise<SendMessageResponse> {
    return ApiService.getResponseData(await this.client.post<SendMessageResponse>('/messages', messagePayload))
  }

  public async setMessageDelivered (messageId: string): Promise<MessageDeliveredResponse> {
    return ApiService.getResponseData(await this.client.put<MessageDeliveredResponse>(`/messages/${messageId}/delivered`))
  }

  public async setMessageSeen (messageId: string): Promise<MessageSeenResponse> {
    return ApiService.getResponseData(await this.client.put<MessageSeenResponse>(`/messages/${messageId}/seen`))
  }

  public async getCounters (page: number = 1, perPage: number = 20): Promise<CountersResponse> {
    return ApiService.getResponseData(await this.client.get<CountersResponse>('/counters', {
      params: {
        page: page,
        per_page: perPage,
      }
    }))
  }

  public async getUserBlocks (): Promise<BlocksResponse> {
    return ApiService.getResponseData(await this.client.get<BlocksResponse>(`/messaging/blocked-users`))
  }

  public async getBlockedUser (userId: string): Promise<BlockedUser> {
    return ApiService.getResponseData(await this.client.get<BlockedUser>(`/messaging/blocked-users/${userId}`))
  }

  public async blockUser (userId: string): Promise<BlockedUser> {
    return ApiService.getResponseData(await this.client.put<BlockedUser>(`/messaging/blocked-users/${userId}`))
  }

  public async unblockUser (userId: string): Promise<void> {
    await this.client.delete<void>(`/messaging/blocked-users/${userId}`)
  }

}
