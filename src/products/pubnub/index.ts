import { Transport } from './interfaces'
import { createPubnubClient } from './client'
import * as Pubnub from 'pubnub'
import {Logger} from "@nestjs/common";

let client: Transport.Client | undefined
const logger = new Logger('pubnub-messaging-service');

export function init (transportConfig: Transport.Config): void {
    client = createPubnubClient(transportConfig)
    logger.log('Client was initialized', { client: client })
}

export async function addChannelsToPubnubChannelGroup (channelAlias: string[], channelGroupId: string): Promise<void> {
    client = getClient()
    const params: Pubnub.AddChannelParameters = {
        channels: channelAlias,
        channelGroup: channelGroupId,
    }
    await client.channelGroups.addChannels(params)
}

export async function removeChannelsFromPubnubChannelGroup (channelAliases: string[], channelGroup: string): Promise<void> {
    client = getClient()

    const params: Pubnub.RemoveChannelParameters = {
        channels: channelAliases,
        channelGroup
    }
    await client.channelGroups.removeChannels(params)
}

/* istanbul ignore next */
function getClient (): Transport.Client {
    if (client === undefined) {
        throw new Error('MISSING_REALTIME_TRANSPORT_CLIENT')
    }
    return client
}
