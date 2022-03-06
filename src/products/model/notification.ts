export enum NotificationAction {
  NewChannelCreated = 'NEW_CHANNEL_CREATED',
  NewMessage = 'NEW_MESSAGE_RECEIVED',
  SeenStatus = 'SEEN_STATUS_RECEIVED',
  DeliveryStatus = 'DELIVERY_STATUS_RECEIVED',
  UserBlocked = 'USER_BLOCKED',
  UserUnblocked = 'USER_UNBLOCKED',
}

export interface ServiceNotification {
  action: string
  sender: string
  payload: object
}
