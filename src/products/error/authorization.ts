export class NoAccessTokenError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, NoAccessTokenError.prototype)
  }
}
