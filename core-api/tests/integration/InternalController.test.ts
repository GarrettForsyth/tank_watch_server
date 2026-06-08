import { vi, beforeAll, beforeEach, afterEach, describe, it, expect } from 'vitest'

vi.mock('../../src/db', async () => {
  const { db } = await import('../helpers/testDb')
  return { db }
})

import request from 'supertest'
import { sqlite, db } from '../helpers/testDb'
import { sensorConfig } from '../../src/db/schema'
import { seedBaseFixture, type BaseFixture } from '../helpers/fixtures'
import { app } from '../../src/app'

let fixture: BaseFixture

beforeAll(() => { fixture = seedBaseFixture() })
beforeEach(() => { sqlite.exec('BEGIN') })
afterEach(()  => { sqlite.exec('ROLLBACK') })

// ─── GET /internal/sensors/config ────────────────────────────────────────────

describe('GET /internal/sensors/config', () => {
  it('returns 200 with the sensor configuration when one exists', async () => {
    db.insert(sensorConfig).values({
      sensorId: fixture.sensorId,
      updateIntervalSeconds: 45,
      notificationsEnabled: true,
      minValue: 18,
      maxValue: 28,
    }).run()

    const res = await request(app)
      .get(`/internal/sensors/config?romAddress=${fixture.romAddress}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      updateIntervalSeconds: 45,
      notificationsEnabled: true,
      minValue: 18,
      maxValue: 28,
    })
    expect(typeof res.body.id).toBe('number')
  })

  it('returns 404 when the sensor has no configuration', async () => {
    // Sensor exists in the fixture but no sensorConfig row has been inserted.
    const res = await request(app)
      .get(`/internal/sensors/config?romAddress=${fixture.romAddress}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Sensor configuration not found' })
  })

  it('returns 404 when the romAddress does not match any sensor', async () => {
    const res = await request(app)
      .get('/internal/sensors/config?romAddress=28-does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Sensor configuration not found' })
  })
})
