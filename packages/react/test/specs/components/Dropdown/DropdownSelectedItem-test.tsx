import * as React from 'react'

import { DropdownSelectedItem } from '@fluentui/react'
import { getRenderedAttribute } from '../../commonTests'
import { mountWithProviderAndGetComponent } from '../../../utils'

describe('DropdownSelectedItem', () => {
  describe('active', () => {
    it('sets tabindex to 0 when true', () => {
      const dropdownSelectedItemComponent = mountWithProviderAndGetComponent(
        DropdownSelectedItem,
        <DropdownSelectedItem active />,
      )
      expect(getRenderedAttribute(dropdownSelectedItemComponent, 'tabindex', '')).toBe('0')
    })

    it('sets tabindex to -1 when falsy', () => {
      const dropdownSelectedItemComponent = mountWithProviderAndGetComponent(
        DropdownSelectedItem,
        <DropdownSelectedItem />,
      )
      expect(getRenderedAttribute(dropdownSelectedItemComponent, 'tabindex', '')).toBe('-1')
    })
  })
})
