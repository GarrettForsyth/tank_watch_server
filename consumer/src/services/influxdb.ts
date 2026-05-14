/**
 * File: influxdb.ts 
 * Author: Garrett Forsyth
 * Date: May 3rd 2026
 * Description: This file handles access to the influx database.
 *
 * Some Influx DB Notes:
 * The bucket rougly corresponds to a SQL database.
 * Measurements correspond to tables.
 * Tags are like indexed columns: used for filtering + grouping
 * Fields are non-indexed columns: the actual measurement values
 * Timestamps are the primary key. Every point has one autoset.
 * Points correspond to records.
 *
 * The schema is hard to change, especially changing the type.
 *
 */
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const client = new InfluxDB({
    url: process.env.INFLUXDB_URL!,
    token: process.env.INFLUXDB_TOKEN!,
});

const writeApi = client.getWriteApi(
    process.env.INFLUXDB_ORG!,
    process.env.INFLUXDB_BUCKET!,
    's', // timestamp precision -> seconds
    // Note: These are the default settings, but for some reason, without
    // explicitly setting them here they wre not being applied.
    {
      batchSize: 1000,        // How many points to batch before a write
      flushInterval: 1000,    // How often (in ms) to write the current batch
      writeFailed: (error, lines, _attempts, _expires) => {
        console.error('InfluxDB write failed:', error.message);
        console.error('Failed lines:', lines);
      }
    },
);

export function writeReading(
    value: number,
    deviceId: string,
    measurementType: string,
    sensorModel: string,
    romAddress: string
): void {
    const point = new Point(measurementType)
        .tag('device_id', deviceId)
        .tag('sensor_model', sensorModel)
        .tag('rom_address', romAddress)
        .floatField('value', value);

    writeApi.writePoint(point);
}
