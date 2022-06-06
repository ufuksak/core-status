import { Transport } from "./interfaces";
import { createPubnubClient } from "./client";
import * as Pubnub from "pubnub";
import { Logger } from "@nestjs/common";
import PubNub = require("pubnub");
import { ListChannelsResponse } from "pubnub";
import { PubnubNotification } from "./notification";

let client: Transport.Client | undefined;
const logger = new Logger("pubnub-core-status");

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve({}), ms));
let receivedMessage = null;

export function addListener(transportConfig: Transport.Config): void {
  client = createPubnubClient(transportConfig);
  logger.log("Pubnub Client was initialized", { client: client });

  client.addListener({
    message: function(event) {
      receivedMessage = event?.message;
    },
  });
}

export async function addChannelsToPubnubChannelGroup(
  channelAlias: string[],
  channelGroupId: string
): Promise<void> {
  client = getClient();
  const params: Pubnub.AddChannelParameters = {
    channels: channelAlias,
    channelGroup: channelGroupId,
  };
  await client.channelGroups.addChannels(params);
}

export async function removeChannelsFromPubnubChannelGroup(
  channelAliases: string[],
  channelGroup: string
): Promise<void> {
  client = getClient();

  const params: Pubnub.RemoveChannelParameters = {
    channels: channelAliases,
    channelGroup,
  };
  await client.channelGroups.removeChannels(params);
}

export async function listPubnubChannelGroup(
  channelGroup: string
): Promise<ListChannelsResponse> {
  client = getClient();

  const params: Pubnub.ListChannelsParameters = {
    channelGroup,
  };
  return await client.channelGroups.listChannels(params);
}

export async function waitUntilSubscribed(
  grantChannel: string,
  recipient_id: string
) {
  while (true) {
    await sleep(1000);
    const response: PubNub.HereNowResponse = await client.hereNow({
      channels: [grantChannel],
      includeUUIDs: true,
      includeState: false,
    });

    if (
      response?.channels[grantChannel].occupants.find(
        (el) => el.uuid === recipient_id
      )
    ) {
      break;
    }
  }
}

export async function subscribeToChannel(channelAliases: string[]) {
  client = getClient();

  const params: Pubnub.SubscribeParameters = {
    channels: channelAliases,
  };

  await client.subscribe(params);
}

export async function unsubscribeFromChannel(channelAliases: string[]) {
  client = getClient();

  const params: Pubnub.UnsubscribeParameters = {
    channels: channelAliases,
  };

  await client.unsubscribe(params);
}

export async function pubnubPublish(
  grantChannel: string,
  payload: PubnubNotification
) {
  client = getClient();

  const params: Pubnub.PublishParameters = {
    message: JSON.stringify({
      event: {
        type: "Shared",
        stream: payload.streamId,
      },
      pn_apns: {
        aps: {
          alert: {
            title: payload.title,
            body: payload.message,
          },
        },
        data: {
          domain: payload.domain,
          type: payload.type,
          from: payload.from,
          attributes: payload.data,
        },
      },
      pn_gcm: {
        data: {
          title: payload.title,
          body: payload.message,
        },
        domain: payload.domain,
        type: payload.type,
        from: payload.from,
        attributes: payload.data,
      },
    }),
    channel: grantChannel,
    storeInHistory: true,
    ttl: 10,
  };

  await client.publish(params, function(status, response) {
    if (status.error) {
      logger.log("publishing failed w/ status: ", status);
    } else {
      logger.log("message published w/ server response: ", response);
    }
  });
}

export async function getMessages(
  grantChannel: string
): Promise<Pubnub.FetchMessagesResponse> {
  client = getClient();

  const params: Pubnub.FetchMessagesParameters = {
    channels: [grantChannel],
    includeMeta: true,
    count: 25,
  };
  return await client.fetchMessages(params);
}

/* istanbul ignore next */
function getClient(): Transport.Client {
  if (client === undefined) {
    throw new Error("MISSING_REALTIME_TRANSPORT_CLIENT");
  }
  return client;
}
