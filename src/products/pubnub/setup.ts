import * as dotenv from 'dotenv'
dotenv.config()
process.env.DATABASE_CONNECTION_URL = 'bad connection string' // disable DB

import * as asPromised from 'chai-as-promised'
import * as chaiMatchPattern from 'chai-match-pattern'
import * as chai from 'chai'
import {
  initStubs,
  SANDBOX
} from 'micro-kit-atlas/testing'
import * as sinonChai from 'sinon-chai'
import * as dirtyChai from 'dirty-chai'
import * as _ from 'lodash'
import { atlasLodash } from 'micro-kit-atlas'

export {
  chai
}

_.mixin(atlasLodash)

chai.use(asPromised)
chai.use(chaiMatchPattern)
chai.use(sinonChai)
chai.use(dirtyChai)

initStubs()

export const expect: Chai.ExpectStatic = chai.expect

afterEach((): void => {
  SANDBOX.reset()
})
