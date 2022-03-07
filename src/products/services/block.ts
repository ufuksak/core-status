import { ApiService } from './api'
import { BlockedUser, BlocksResponse } from '../model'

export class BlockService {

  private readonly apiService: ApiService

  constructor (apiService: ApiService) {
    this.apiService = apiService
  }

  public async getUserBlocks (): Promise<BlocksResponse> {
    return this.apiService.getUserBlocks()
  }

  public async getBlockedUser (userId: string): Promise<BlockedUser> {
    return this.apiService.getBlockedUser(userId)
  }

  public async blockUser (userId: string): Promise<BlockedUser> {
    return this.apiService.blockUser(userId)
  }

  public async unblockUser (userId: string): Promise<void> {
    return this.apiService.unblockUser(userId)
  }

}
