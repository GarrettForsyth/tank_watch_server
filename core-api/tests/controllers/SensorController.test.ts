import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/db', () => ({ db: {} }))

import { SensorRouteParams, UpsertSensorConfigBody } from '../../src/controllers/SensorController'

describe('SensorRouteParams', () => {
  it('accepts a positive integer sensorId', () => {
    expect(() => SensorRouteParams.parse({ sensorId: 7 })).not.toThrow()
  })

  it('coerces a numeric string to a number', () => {
    const result = SensorRouteParams.parse({ sensorId: '99' })
    expect(result.sensorId).toBe(99)
  })

  it('rejects zero', () => {
    expect(() => SensorRouteParams.parse({ sensorId: 0 })).toThrow()
  })

  it('rejects a negative number', () => {
    expect(() => SensorRouteParams.parse({ sensorId: -1 })).toThrow()
  })

  it('rejects a non-integer', () => {
    expect(() => SensorRouteParams.parse({ sensorId: 3.14 })).toThrow()
  })

  it('rejects missing sensorId', () => {
    expect(() => SensorRouteParams.parse({})).toThrow()
  })
})

const baseConfig = {
  updateIntervalSeconds: 60,
  notificationsEnabled: true,
  minValue: 10,
  maxValue: 100,
}

describe('UpsertSensorConfigBody', () => {
  describe('updateIntervalSeconds', () => {
    it('accepts the minimum value of 10', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, updateIntervalSeconds: 10 })).not.toThrow()
    })

    it('accepts values greater than 10', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, updateIntervalSeconds: 3600 })).not.toThrow()
    })

    it('rejects 9 (below minimum)', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, updateIntervalSeconds: 9 })).toThrow()
    })

    it('rejects 0', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, updateIntervalSeconds: 0 })).toThrow()
    })

    it('rejects a non-integer', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, updateIntervalSeconds: 10.5 })).toThrow()
    })
  })

  describe('notificationsEnabled', () => {
    it('accepts true', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, notificationsEnabled: true })).not.toThrow()
    })

    it('accepts false', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, notificationsEnabled: false })).not.toThrow()
    })

    it('rejects a string', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, notificationsEnabled: 'yes' })).toThrow()
    })

    it('rejects a number', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, notificationsEnabled: 1 })).toThrow()
    })
  })

  describe('minValue / maxValue', () => {
    it('accepts integer min and max with min < max', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: 0, maxValue: 50 })).not.toThrow()
    })

    it('accepts null for both', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: null, maxValue: null })).not.toThrow()
    })

    it('accepts null minValue with a set maxValue', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: null, maxValue: 50 })).not.toThrow()
    })

    it('accepts null maxValue with a set minValue', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: 10, maxValue: null })).not.toThrow()
    })

    it('accepts negative values when min < max', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: -50, maxValue: -10 })).not.toThrow()
    })

    it('rejects minValue equal to maxValue', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: 50, maxValue: 50 })).toThrow()
    })

    it('rejects minValue greater than maxValue', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: 100, maxValue: 50 })).toThrow()
    })

    it('rejects a float minValue', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, minValue: 10.5 })).toThrow()
    })

    it('rejects a float maxValue', () => {
      expect(() => UpsertSensorConfigBody.parse({ ...baseConfig, maxValue: 100.5 })).toThrow()
    })
  })

  describe('missing fields', () => {
    it('rejects an empty object', () => {
      expect(() => UpsertSensorConfigBody.parse({})).toThrow()
    })
  })
})
