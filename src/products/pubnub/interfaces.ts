import * as Pubnub from 'pubnub'

export namespace Transport {
    export type Config = Pubnub.PubnubConfig
    export type Client = Pubnub
}

export interface AddChannelsToPubnubPayload {
    gid_uuid: string
    channelGroupId: string
}

export interface UserRealtimeNotificationChannels {
    gidUuid: string
    channelAliases: string[]
}
