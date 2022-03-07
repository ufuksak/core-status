import * as chai from 'chai'
import * as asPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'
import * as dirtyChai from 'dirty-chai'
import * as chaiMatchPattern from 'chai-match-pattern'

chai.use(asPromised)
chai.use(chaiMatchPattern)
chai.use(sinonChai)
chai.use(dirtyChai)
chai.should()

export const expect: Chai.ExpectStatic = chai.expect
