import { vi, beforeAll, beforeEach, afterEach, describe, it, expect } from 'vitest'

vi.mock('../../src/db', async () => {
  const { db } = await import('../helpers/testDb')
  return { db }
})

vi.mock('@tankwatch/shared-infra', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tankwatch/shared-infra')>()
  return {
    ...actual,
    getPublisher: () => ({ publish: vi.fn().mockResolvedValue('0') }),
    getSubscriber: () => ({ subscribe: vi.fn(), on: vi.fn() }),
  }
})

import request from 'supertest'
import { sqlite, db } from '../helpers/testDb'
import { pushTokens } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import { seedBaseFixture } from '../helpers/fixtures'
import { app } from '../../src/app'

beforeAll(() => { seedBaseFixture() })
beforeEach(() => { sqlite.exec('BEGIN') })
afterEach(()  => { sqlite.exec('ROLLBACK') })

// ─── PUT /notifications/token ─────────────────────────────────────────────────

describe('PUT /notifications/token', () => {
  it('returns 204 when a new token is inserted', async () => {
    const res = await request(app)
      .put('/notifications/token')
      .send({ token: 'ExponentPushToken[abc123]' })

    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  it('returns 204 and updates the token when one already exists for the user', async () => {
    db.insert(pushTokens).values({ userId: 1, token: 'ExponentPushToken[old]' }).run()

    const res = await request(app)
      .put('/notifications/token')
      .send({ token: 'ExponentPushToken[new]' })

    expect(res.status).toBe(204)

    // The upsert must replace in-place, not create a second row.
    const rows = db.select().from(pushTokens).where(eq(pushTokens.userId, 1)).all()
    expect(rows).toHaveLength(1)
    expect(rows[0]!.token).toBe('ExponentPushToken[new]')
  })

  it('returns 400 when the token field is missing', async () => {
    const res = await request(app)
      .put('/notifications/token')
      .send({})

    expect(res.status).toBe(400)
  })
})
