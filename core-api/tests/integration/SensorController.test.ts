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
import { sensorConfig } from '../../src/db/schema'
import { seedBaseFixture, type BaseFixture } from '../helpers/fixtures'
import { app } from '../../src/app'

let fixture: BaseFixture

beforeAll(() => { fixture = seedBaseFixture() })
beforeEach(() => { sqlite.exec('BEGIN') })
afterEach(()  => { sqlite.exec('ROLLBACK') })

const validBody = {
  updateIntervalSeconds: 60,
  notificationsEnabled: true,
  minValue: 10,
  maxValue: 30,
}

// ─── GET /sensors/:sensorId ───────────────────────────────────────────────────

describe('GET /sensors/:sensorId', () => {
  it('returns 200 with sensor augmented by deviceName and tankName', async () => {
    const res = await request(app).get(`/sensors/${fixture.sensorId}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: fixture.sensorId,
      model: 'DS18B20',
      romAddress: fixture.romAddress,
      displayName: null,
      // device has no name, so falls back to macAddress
      deviceName: fixture.macAddress,
      tankName: 'Test Tank',
    })
  })

  it('returns 404 when the sensor does not exist', async () => {
    const res = await request(app).get('/sensors/9999')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Sensor not found' })
  })

  it('returns 400 for a non-numeric sensorId', async () => {
    const res = await request(app).get('/sensors/abc')

    expect(res.status).toBe(400)
  })
})

// ─── GET /sensors/:sensorId/config ───────────────────────────────────────────

describe('GET /sensors/:sensorId/config', () => {
  it('returns 404 when the sensor exists but has no configuration', async () => {
    const res = await request(app).get(`/sensors/${fixture.sensorId}/config`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Sensor configuration not found' })
  })

  it('returns 200 with the stored configuration', async () => {
    db.insert(sensorConfig).values({
      sensorId: fixture.sensorId,
      updateIntervalSeconds: 30,
      notificationsEnabled: true,
      minValue: 15,
      maxValue: 35,
    }).run()

    const res = await request(app).get(`/sensors/${fixture.sensorId}/config`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      updateIntervalSeconds: 30,
      notificationsEnabled: true,
      minValue: 15,
      maxValue: 35,
    })
    expect(typeof res.body.id).toBe('number')
  })

  it('returns 200 with null thresholds when none were set', async () => {
    db.insert(sensorConfig).values({
      sensorId: fixture.sensorId,
      updateIntervalSeconds: 30,
      notificationsEnabled: false,
      minValue: null,
      maxValue: null,
    }).run()

    const res = await request(app).get(`/sensors/${fixture.sensorId}/config`)

    expect(res.status).toBe(200)
    expect(res.body.minValue).toBeNull()
    expect(res.body.maxValue).toBeNull()
  })

  it('returns 404 when the sensor does not exist', async () => {
    const res = await request(app).get('/sensors/9999/config')

    expect(res.status).toBe(404)
  })

  it('returns 400 when sensorId is zero', async () => {
    const res = await request(app).get('/sensors/0/config')

    expect(res.status).toBe(400)
  })

  it('returns 400 when sensorId is non-numeric', async () => {
    const res = await request(app).get('/sensors/abc/config')

    expect(res.status).toBe(400)
  })
})

// ─── PUT /sensors/:sensorId/config ───────────────────────────────────────────

describe('PUT /sensors/:sensorId/config', () => {
  it('inserts and returns a new configuration when none exists', async () => {
    const res = await request(app)
      .put(`/sensors/${fixture.sensorId}/config`)
      .send(validBody)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject(validBody)
    expect(typeof res.body.id).toBe('number')
  })

  it('updates and returns the configuration when one already exists', async () => {
    db.insert(sensorConfig).values({
      sensorId: fixture.sensorId,
      updateIntervalSeconds: 30,
      notificationsEnabled: true,
      minValue: null,
      maxValue: null,
    }).run()

    const update = { updateIntervalSeconds: 120, notificationsEnabled: false, minValue: 5, maxValue: 25 }
    const res = await request(app)
      .put(`/sensors/${fixture.sensorId}/config`)
      .send(update)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject(update)
  })

  it('preserves null thresholds when min and max are both null', async () => {
    const res = await request(app)
      .put(`/sensors/${fixture.sensorId}/config`)
      .send({ ...validBody, minValue: null, maxValue: null })

    expect(res.status).toBe(200)
    expect(res.body.minValue).toBeNull()
    expect(res.body.maxValue).toBeNull()
  })

  it('returns 404 when the sensor does not exist', async () => {
    const res = await request(app)
      .put('/sensors/9999/config')
      .send(validBody)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Sensor not found' })
  })

  it('returns 400 when minValue is greater than maxValue', async () => {
    const res = await request(app)
      .put(`/sensors/${fixture.sensorId}/config`)
      .send({ ...validBody, minValue: 100, maxValue: 50 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
  })

  it('returns 400 when updateIntervalSeconds is below the minimum of 10', async () => {
    const res = await request(app)
      .put(`/sensors/${fixture.sensorId}/config`)
      .send({ ...validBody, updateIntervalSeconds: 9 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when the request body is empty', async () => {
    const res = await request(app)
      .put(`/sensors/${fixture.sensorId}/config`)
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 400 when sensorId is zero', async () => {
    const res = await request(app)
      .put('/sensors/0/config')
      .send(validBody)

    expect(res.status).toBe(400)
  })

  it('returns 400 when sensorId is non-numeric', async () => {
    const res = await request(app)
      .put('/sensors/abc/config')
      .send(validBody)

    expect(res.status).toBe(400)
  })
})
