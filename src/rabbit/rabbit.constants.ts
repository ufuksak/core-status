export const GLOBAL_DEAD_LETTER_EXCHANGE = process.env.GLOBAL_DEAD_LETTER_EXCHANGE ?? 'dead.dead-letter';
export const RETRY_EXCHANGE = process.env.RETRY_EXCHANGE ?? 'retry';
export const MAX_MESSAGE_RETRY = parseInt(process.env.MAX_MESSAGE_RETRY ?? '3');
export const RETRY_EXCHANGE_PREFIX = 'retry.retry-queue';
export const INITIAL_RETRY_INTERVAL = parseInt(process.env.INITIAL_RETRY_INTERVAL ?? '200');
export const RETRY_FACTOR = parseFloat(process.env.RETRY_FACTOR ?? '1.1');
export const RETRY_WAIT_ENDED_QUEUE = process.env.RETRY_WAIT_ENDED_QUEUE ?? 'retry-wait-ended';

export const X_ORIGINAL_EXCHANGE = <string>'x-original-exchange';
export const X_ORIGINAL_ROUTING_KEY = <string>'x-original-routing-key';
export const X_RETRY_COUNT = <string>'x-retry-count';

export const X_MESSAGE_TTL = 'x-message-ttl';
export const X_DEAD_LETTER_ROUTING_KEY = 'x-dead-letter-routing-key';
export const X_DEAD_LETTER_EXCHANGE = 'x-dead-letter-exchange';
