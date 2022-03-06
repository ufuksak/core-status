// tslint:disable:no-commented-code
// tslint:disable:no-any
// tslint:disable:no-unsafe-any

import * as sinon from 'sinon'

export const SANDBOX: sinon.SinonSandbox = sinon.createSandbox()

// tslint:disable-next-line:no-unused
type ArgsType<T> = T extends (...args: infer A) => any ? A : never
export type SinonModuleStub<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? sinon.SinonStub<ArgsType<T[P]>, ReturnType<T[P]>> : T[P];
} & T
const DEFAULT_STUB_MAX_DEPTH: number = 5

export function stubModule<T extends { [k: string]: any }> (
  origModule: T,
  ignore: string[] = [],
  maxDepth: number = DEFAULT_STUB_MAX_DEPTH,
): SinonModuleStub<T> {
  const stub: any = {}
  Object.getOwnPropertyNames(origModule).forEach((key: string) => {
    if (ignore.includes(key)) {
      return
    }

    if (origModule[key] instanceof Function) {
      stub[key] = SANDBOX.stub()
    } else if (origModule[key] instanceof Object && maxDepth > 1) {
      stub[key] = stubModule(origModule[key], ignore, maxDepth - 1)
    }
  })

  return <SinonModuleStub<T>> stub
}

export function stubInstance<T extends { [k: string]: any }> (
  origInstance: T,
): SinonModuleStub<T> {
  Object.getOwnPropertyNames(origInstance).forEach((key: string) => {
    if (origInstance[key] instanceof Function) {
      origInstance[key].callThrough()
    }
  })

  return origInstance
}

export function resetStubs (): void {
  SANDBOX.reset()
  SANDBOX.restore()
}
