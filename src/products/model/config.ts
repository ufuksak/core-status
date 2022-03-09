/**
 * @internal
 */
export const IS_DEBUG: boolean = process.env.NODE_ENV === 'debug'

/**
 * @internal
 */
export const IS_DEBUG_KEYSTORE: boolean = process.env.NODE_ENV === 'debugkeystore'

/**
 * @internal
 */
export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === 'development'

/**
 * @internal
 */
export const IS_STAGING: boolean = process.env.NODE_ENV === 'staging'

/**
 * @internal
 */
export const PRODUCTION_API_URL: string = 'https://api.global.id/v1'

/**
 * @internal
 */
export const STAGING_API_URL: string = 'https://staging-api.gidstaging.net/v1'

/**
 * @internal
 */
export const DEV_API_URL: string = 'https://dev-api.gidstaging.net/v1'

/**
 * @internal
 */
export const DEBUG_API_URL: string = process.env.SDK_CUSTOM_API_URL !== undefined ? process.env.SDK_CUSTOM_API_URL : 'http://localhost:9836/v1'

/**
 * @internal
 */
export const DEBUG_KEYSTORE_API_URL: string = process.env.SDK_CUSTOM_API_URL !== undefined ? process.env.SDK_CUSTOM_API_URL : 'http://localhost:9123/v1'


/**
 * @internal
 */
export const API_URL: string = ((): string => {
  if (IS_DEBUG) {
    return DEBUG_API_URL
  }

  if (IS_DEBUG_KEYSTORE) {
    return DEBUG_KEYSTORE_API_URL
  }

  if (IS_DEVELOPMENT) {
    return DEV_API_URL
  }

  if (IS_STAGING) {
    return STAGING_API_URL
  }

  return PRODUCTION_API_URL
})()

export interface Config {
  accessToken: string
}
