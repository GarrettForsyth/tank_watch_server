/*******************************************************************************
 * Filename: ReadingRepository.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Repository for accessing readings published by devices.
 *
 * Note: There's no ORM for InfluxDB in TypeScript. Instead we use raw Flux.
 ******************************************************************************/
import { influxQueryApi } from '../db/influxdb'
import { FluxTableMetaData } from '@influxdata/influxdb-client'
import { Reading } from '../models/Reading'

const BUCKET = process.env.INFLUXDB_BUCKET!;

export class ReadingRepository {

  /**
   * TODO:  Allow filtering by measurement to query different sensor
   * channels (ex/ a sensor might publish to acc_x or gyr_z instead of temp)
   *
   * Descripton: Gets readings from the InfluxDB over a time period.
   *
   * Note: Currently there is no way to distinguish between having 
   * multiple sensors on the same device, but this should be updated
   * when implemented. 
   *
   * The time period is the range until the momement the query is made,
   * so "1h" would give the readings in the past hour.
   *
   * Also, the firmware publishes its device id as the mac address. do 
   * not confuse this with the deviceId from the SQLite table.
   *
   * 
   * Parmeters:
   *   - romAddress: The rom address of the sensor reporting the readings.
   *   - range: The time range to in which to get readings for (ex/ 1h, 30m, 3w, 6mo, 1y)
   * Returns: A Promising containing the list of Readings if any.
   */
  async getLastReadings(
    romAddress: string,
    range: string
  ): Promise<Reading[]> {
    const readings: Reading[] = [];

    const query = `
      from(bucket: "${BUCKET}")
      |> range(start: -${range})
      |> filter(fn: (r) => r._measurement == "temperature")
      |> filter(fn: (r) => r.rom_address == "${romAddress}")
      |> filter(fn: (r) => r._field == "value")
      `;

    await new Promise<void>((resolve, reject) => {
      influxQueryApi.queryRows(query, {
        next(row: string[], tableMeta: FluxTableMetaData) {
          const record = tableMeta.toObject(row);
          readings.push(Reading.fromInflux(record));
        },
        error: reject,
        complete: resolve,
      });
    });

    return readings;
  }
}
