/*******************************************************************************
 * Filename: app.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description: Entry point of the appliation.
 *
 * Creates the express app, sets the middlware, routes, and error handler.
 ******************************************************************************/
import express from 'express';
import { authenticate } from './middleware/authenticate'
import { errorHandler } from './middleware/errorHandler';
import { ReadingRepository } from './repositories/ReadingRepository';
import { DeviceRepository } from './repositories/DeviceRepository';
import { SensorRepository } from './repositories/SensorRepository';
import { NotificationRepository } from './repositories/NotificationRepository';
import { createReadingsRouter } from './routes/readings'
import { createDevicesRouter } from './routes/devices';
import { createSensorsRouter } from './routes/sensors';
import { createNotificationsRouter } from './routes/notifications';

const readingRepository = new ReadingRepository();
const deviceRepository = new DeviceRepository();
const sensorRepository = new SensorRepository();
const notificationRepository = new NotificationRepository();

export const app = express();
app.use(authenticate);
app.use(express.json());
app.use('/api/readings/', createReadingsRouter(readingRepository, sensorRepository, deviceRepository));
app.use('/api/devices/', createDevicesRouter(deviceRepository));
app.use('/api/sensors/', createSensorsRouter(sensorRepository));
app.use('/api/notifications/', createNotificationsRouter(notificationRepository));
app.use(errorHandler)
