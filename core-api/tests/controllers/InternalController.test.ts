import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/db', () => ({ db: {} }))

import { GetConfigByRomAddressQuery } from '../../src/controllers/InternalController'

describe('GetConfigByRomAddressQuery', () => {
  it('accepts a valid rom address string', () => {
    expect(() => GetConfigByRomAddressQuery.parse({ romAddress: '28-abc123ef' })).not.toThrow()
  })

  it('coerces a number to a string', () => {
    const result = GetConfigByRomAddressQuery.parse({ romAddress: 123 })
    expect(result.romAddress).toBe('123')
  })

  it('rejects an empty string', () => {
    expect(() => GetConfigByRomAddressQuery.parse({ romAddress: '' })).toThrow()
  })
})
