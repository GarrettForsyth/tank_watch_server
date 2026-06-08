import { vi, beforeAll, beforeEach, afterEach, describe, it, expect } from 'vitest'

vi.mock('../../src/db', async () => {
  const { db } = await import('../helpers/testDb')
  return { db }
})

import request from 'supertest'
import { sqlite } from '../helpers/testDb'
import { seedBaseFixture, type BaseFixture } from '../helpers/fixtures'
import { app } from '../../src/app'

let fixture: BaseFixture

beforeAll(() => { fixture = seedBaseFixture() })
beforeEach(() => { sqlite.exec('BEGIN') })
afterEach(()  => { sqlite.exec('ROLLBACK') })

// ─── GET /devices/ ────────────────────────────────────────────────────────────

describe('GET /devices/', () => {
  it('returns 200 with all devices belonging to the user', async () => {
    const res = await request(app).get('/devices/')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      id: fixture.deviceId,
      tankId: fixture.tankId,
      macAddress: fixture.macAddress,
      name: null,
    })
  })
})

// ─── GET /devices/:deviceId/sensors ──────────────────────────────────────────

describe('GET /devices/:deviceId/sensors', () => {
  it('returns 200 with sensors for the device', async () => {
    const res = await request(app).get(`/devices/${fixture.deviceId}/sensors`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      id: fixture.sensorId,
      deviceId: fixture.deviceId,
      model: 'DS18B20',
      romAddress: fixture.romAddress,
      displayName: null,
    })
  })

  it('returns 200 with an empty array when the device has no sensors', async () => {
    const res = await request(app).get('/devices/9999/sensors')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns 400 for a non-numeric deviceId', async () => {
    const res = await request(app).get('/devices/abc/sensors')

    expect(res.status).toBe(400)
  })
})
