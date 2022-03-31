import {PushNotificationDto} from './push-notiification.dto';

const PubNub = require('pubnub');

export class PushNotificationClient {
    private pubnub;

    constructor() {
        console.log("PubNub initialized");
        this.pubnub = new PubNub({
            subscribeKey: "sub-c-1af442ac-abb3-11ec-ab7a-66fb1d4f8b52",
            publishKey: "pub-c-1d5d956c-f55f-441a-96f3-701cb9c96318",
            secretKey: "sec-c-OGFiYjY4MTQtZTIzMi00MmIxLTk3N2YtOTY2MDAwOWRlYmZm",
            ssl: true,
            uuid: "myUUID"
        });
    }

    public publish(payload: PushNotificationDto) {
        var {title, message, domain, type, from, targets} = payload;
        var channels = this.buildChannels(domain, targets);
        channels.map(channel => this.pubnub.publish(
            {
                message: this.buildPushNotificationMessage(payload),
                channel: channel,
                sendByPost: false, // true to send via post
                storeInHistory: true, //override default storage options
            },
            function (status, response) {
                if (status.error) {
                    // handle error
                    console.log(status);
                } else {
                    console.log("message Published w/ timetoken", response.timetoken, "to channel: ", channel);
                }
            }
        ));
    }

    private buildChannels(domain: string, targets: string[]): string[] {
        return targets.map(target => `users-${target}`);
    }

    private buildPushNotificationMessage(payload: PushNotificationDto) {
        return {
            "pn_apns": {
                "aps": {
                    "alert": {
                        "title": payload.title,
                        "body": payload.message
                    }
                },
                "data": {
                    "domain": payload.domain,
                    "type": payload.type,
                    "from": payload.from,
                    "attributes": payload.data
                }
            },
            "pn_gcm": {
                "data": {
                    "title": payload.title,
                    "body": payload.message,
                },
                "domain": payload.domain,
                "type": payload.type,
                "from": payload.from,
                "attributes": payload.data,
            }
        };
    }
}
