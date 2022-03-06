// tslint:disable:no-commented-code
// tslint:disable:max-func-body-length

import { expect } from '../../../test/unit/setup'
import { isEmpty } from './validation'

describe('Validation utils', () => {

  describe('#isEmptyString', () => {
    it('should check empty string and return true', async () => {
      const result: boolean = isEmpty('')

      expect(result).to.be.true;
    })

    it('should check non empty string and return false', async () => {
      const result: boolean = isEmpty('non-empty')

      expect(result).to.be.false;
    })

    it('should check null argument and return true', async () => {
      const result: boolean = isEmpty(null)

      expect(result).to.be.true;
    })

    it('should check without argument and return true', async () => {
      const result: boolean = isEmpty()

      expect(result).to.be.true;
    })
  })

})
