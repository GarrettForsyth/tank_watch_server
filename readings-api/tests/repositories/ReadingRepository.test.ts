/*******************************************************************************
 * Filename: ReadingRepository.test.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: November 18th 2026
 * Description: Tests for the Flux queries built by ReadingRepository.
 *
 * InfluxDB is mocked: these tests capture the query passed to collectRows and
 * check the generated Flux text, so values can't break out of their literals.
 ******************************************************************************/
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { ParameterizedQuery } from '@influxdata/influxdb-client'

// ReadingRepository reads INFLUXDB_BUCKET at import time, so set it first.
vi.hoisted(() => {
  process.env.INFLUXDB_BUCKET = 'test-bucket'
})

const collectRows = vi.hoisted(() => vi.fn())
vi.mock('../../src/db/influxdb', () => ({ influxQueryApi: { collectRows } }))

import { ReadingRepository } from '../../src/repositories/ReadingRepository'
import { Reading } from '../../src/models/Reading'

const VALID_ID = '63399cab37ff55532f3f0473a0192b62'

/** Runs getLastReadings and returns the Flux text it sent to InfluxDB. */
async function queryFor(romAddress: string, range: string): Promise<string> {
  await new ReadingRepository().getLastReadings(romAddress, range)
  const query = collectRows.mock.calls.at(-1)?.[0] as ParameterizedQuery
  return query.toString()
}

describe('ReadingRepository.getLastReadings', () => {
  beforeEach(() => {
    collectRows.mockReset()
    collectRows.mockResolvedValue([])
  })

  it('queries the configured bucket as a string literal', async () => {
    expect(await queryFor(VALID_ID, '24h')).toContain('from(bucket: "test-bucket")')
  })

  it('filters on the sensor ID as a string literal', async () => {
    expect(await queryFor(VALID_ID, '24h')).toContain(`r.rom_address == "${VALID_ID}"`)
  })

  it('passes the range as a duration', async () => {
    expect(await queryFor(VALID_ID, '7d')).toContain('range(start: -duration(v: "7d"))')
  })

  it('escapes quotes so a malicious ID stays inside its string literal', async () => {
    const flux = await queryFor('x") or true or ("', '24h')
    expect(flux).toContain(String.raw`r.rom_address == "x\") or true or (\""`)
    // No unescaped quote that would close the literal early.
    expect(flux).not.toMatch(/r\.rom_address == "x"\)/)
  })

  it('keeps a malicious range inside the duration string', async () => {
    const flux = await queryFor(VALID_ID, '1h) |> drop(columns: ["_value"]')
    expect(flux).toContain(String.raw`duration(v: "1h) |> drop(columns: [\"_value\"]")`)
  })

  it('maps rows to Readings', async () => {
    const record = {
      _time: '2026-11-18T12:00:00Z',
      _value: 25.5,
      _measurement: 'temperature',
      device_id: 'AABBCCDDEEFF',
      sensor_model: 'DS18B20',
    }
    collectRows.mockImplementation(async (_query, rowMapper) => [
      rowMapper(['row'], { toObject: () => record }),
    ])

    const readings = await new ReadingRepository().getLastReadings(VALID_ID, '1h')

    expect(readings).toEqual([Reading.fromInflux(record)])
  })

  it('propagates query errors', async () => {
    collectRows.mockRejectedValue(new Error('influx down'))
    await expect(new ReadingRepository().getLastReadings(VALID_ID, '1h')).rejects.toThrow('influx down')
  })
})
