import * as Pubnub from 'pubnub'
import { Transport } from './interfaces'

/* istanbul ignore next */
export function createPubnubClient (config: Transport.Config): Transport.Client {
    return new Pubnub(config)
}
