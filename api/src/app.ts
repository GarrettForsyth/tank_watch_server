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
import { readingsRouter } from './routes/readings';

export const app = express();
app.use(authenticate);
app.use(express.json());
app.use('/api/readings/', readingsRouter);
app.use(errorHandler)
