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
import { startBreachSubscriber } from "./subscribers/breachSubscriber"
import { DeviceRepository } from './repositories/DeviceRepository';
import { SensorRepository } from './repositories/SensorRepository';
import { NotificationRepository } from './repositories/NotificationRepository';
import { TankRepository } from './repositories/TankRepository';
import { BreachRepository } from './repositories/BreachRepository';
import { createDevicesRouter } from './routes/devices';
import { createSensorsRouter } from './routes/sensors';
import { createNotificationsRouter } from './routes/notifications';
import { createInternalRouter } from './routes/internal';

const deviceRepository = new DeviceRepository();
const sensorRepository = new SensorRepository();
const notificationRepository = new NotificationRepository();
const tankRepository = new TankRepository();
const breachRepository = new BreachRepository();

export const app = express();
app.use(authenticate);
app.use(express.json());
app.use('/devices/', createDevicesRouter(deviceRepository));
app.use('/sensors/', createSensorsRouter(sensorRepository, deviceRepository, tankRepository));
app.use('/notifications/', createNotificationsRouter(notificationRepository));
app.use('/internal/', createInternalRouter(sensorRepository));
app.use(errorHandler);

startBreachSubscriber(breachRepository);
