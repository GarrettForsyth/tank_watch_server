import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/db', () => ({ db: {} }))

import { GetDeviceSensorsParams } from '../../src/controllers/DeviceController'

describe('GetDeviceSensorsParams', () => {
  it('accepts a positive integer deviceId', () => {
    expect(() => GetDeviceSensorsParams.parse({ deviceId: 1 })).not.toThrow()
  })

  it('coerces a numeric string to a number', () => {
    const result = GetDeviceSensorsParams.parse({ deviceId: '42' })
    expect(result.deviceId).toBe(42)
  })

  it('rejects zero', () => {
    expect(() => GetDeviceSensorsParams.parse({ deviceId: 0 })).toThrow()
  })

  it('rejects a negative number', () => {
    expect(() => GetDeviceSensorsParams.parse({ deviceId: -5 })).toThrow()
  })

  it('rejects a non-integer', () => {
    expect(() => GetDeviceSensorsParams.parse({ deviceId: 1.5 })).toThrow()
  })

  it('rejects a non-numeric string', () => {
    expect(() => GetDeviceSensorsParams.parse({ deviceId: 'abc' })).toThrow()
  })

  it('rejects missing deviceId', () => {
    expect(() => GetDeviceSensorsParams.parse({})).toThrow()
  })
})
