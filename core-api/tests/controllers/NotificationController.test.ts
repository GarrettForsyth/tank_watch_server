import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/db', () => ({ db: {} }))

import { UpsertPushTokenBody } from '../../src/controllers/NotificationController'

describe('UpsertPushTokenBody', () => {
  it('accepts a non-empty token string', () => {
    expect(() => UpsertPushTokenBody.parse({ token: 'ExponentPushToken[abc123]' })).not.toThrow()
  })

  it('rejects an empty string', () => {
    expect(() => UpsertPushTokenBody.parse({ token: '' })).toThrow()
  })

  it('rejects a number (no coercion for z.string)', () => {
    expect(() => UpsertPushTokenBody.parse({ token: 123 })).toThrow()
  })

  it('rejects missing token', () => {
    expect(() => UpsertPushTokenBody.parse({})).toThrow()
  })
})
