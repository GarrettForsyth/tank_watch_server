/*******************************************************************************
 * Filename: influxdb.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description:
 *
 * Service for interacting with the influxdb.
 ******************************************************************************/
import { InfluxDB } from '@influxdata/influxdb-client'

const client = new InfluxDB({
  url: process.env.INFLUXDB_URL!,
  token: process.env.INFLUXDB_TOKEN!
});

export const influxQueryApi = client.getQueryApi(process.env.INFLUXDB_ORG!);

