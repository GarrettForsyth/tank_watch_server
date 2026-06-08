import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/db/influxdb', () => ({ influxQueryApi: {} }))

import { GetReadingsQuery } from '../../src/controllers/ReadingController'

describe('GetReadingsQuery', () => {
  describe('romAddress', () => {
    it('accepts a valid rom address string', () => {
      const result = GetReadingsQuery.parse({ romAddress: '28-abc123ef', range: '24h' })
      expect(result.romAddress).toBe('28-abc123ef')
    })

    it('coerces a number to a string', () => {
      const result = GetReadingsQuery.parse({ romAddress: 42, range: '1h' })
      expect(result.romAddress).toBe('42')
    })

    it('rejects an empty string', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: '' })).toThrow()
    })
  })

  describe('range', () => {
    const validRanges = ['1h', '6h', '24h', '7d', '30d'] as const

    it.each(validRanges)('accepts "%s"', (range) => {
      expect(() => GetReadingsQuery.parse({ romAddress: '28-abc', range })).not.toThrow()
    })

    it('defaults to "24h" when range is omitted', () => {
      const result = GetReadingsQuery.parse({ romAddress: '28-abc' })
      expect(result.range).toBe('24h')
    })

    it('rejects an unlisted range value', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: '28-abc', range: '2h' })).toThrow()
    })

    it('rejects "30m"', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: '28-abc', range: '30m' })).toThrow()
    })

    it('rejects "1y"', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: '28-abc', range: '1y' })).toThrow()
    })
  })
})
