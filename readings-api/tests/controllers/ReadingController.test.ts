import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/db/influxdb', () => ({ influxQueryApi: {} }))

import { GetReadingsQuery } from '../../src/controllers/ReadingController'

// Same format the firmware generates (SensorIdentity.cpp): 32 lowercase hex chars.
const VALID_ID = '63399cab37ff55532f3f0473a0192b62'

describe('GetReadingsQuery', () => {
  describe('romAddress', () => {
    it('accepts a 32-character hex sensor ID', () => {
      const result = GetReadingsQuery.parse({ romAddress: VALID_ID, range: '24h' })
      expect(result.romAddress).toBe(VALID_ID)
    })

    it('rejects a missing romAddress', () => {
      expect(() => GetReadingsQuery.parse({ range: '24h' })).toThrow()
    })

    it('rejects an empty string', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: '' })).toThrow()
    })

    it('no longer coerces numbers', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: 42 })).toThrow()
    })

    it('rejects an old DS18B20-style ROM address', () => {
      expect(() => GetReadingsQuery.parse({ romAddress: '28-abc123ef' })).toThrow()
    })

    it.each([
      ['31 characters', VALID_ID.slice(1)],
      ['33 characters', VALID_ID + 'a'],
      ['non-hex characters', 'g'.repeat(32)],
      ['surrounding whitespace', ` ${VALID_ID} `],
      ['a trailing newline', `${VALID_ID}\n`],
    ])('rejects an ID with %s', (_label, romAddress) => {
      expect(() => GetReadingsQuery.parse({ romAddress })).toThrow()
    })

    it.each([
      ['a Flux string break-out', 'x") or true or ("'],
      ['a pipe into another function', `${VALID_ID}") |> drop(columns: ["_value"]) |> filter(fn: (r) => r._value == "`],
      ['an ID with a Flux comment appended', `${VALID_ID}//`],
    ])('rejects %s', (_label, romAddress) => {
      expect(() => GetReadingsQuery.parse({ romAddress })).toThrow()
    })
  })

  describe('range', () => {
    const validRanges = ['1h', '6h', '24h', '7d', '30d'] as const

    it.each(validRanges)('accepts "%s"', (range) => {
      expect(() => GetReadingsQuery.parse({ romAddress: VALID_ID, range })).not.toThrow()
    })

    it('defaults to "24h" when range is omitted', () => {
      const result = GetReadingsQuery.parse({ romAddress: VALID_ID })
      expect(result.range).toBe('24h')
    })

    it.each(['2h', '30m', '1y', '24h) |> drop(columns: ["_value"]'])('rejects "%s"', (range) => {
      expect(() => GetReadingsQuery.parse({ romAddress: VALID_ID, range })).toThrow()
    })
  })
})
