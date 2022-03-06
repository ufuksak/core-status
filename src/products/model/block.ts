import { PagingResponse } from './response'

export interface BlockedUser {
  id: string
  user_id: string
  blocked_by: string
  blocked_at: string
}

export interface BlockedUsers {
  blocked_users: BlockedUser[]
}

export interface BlocksResponse extends PagingResponse {
  data: BlockedUsers
}
