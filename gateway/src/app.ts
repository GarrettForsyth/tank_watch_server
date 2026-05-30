/*******************************************************************************
 * Filename: app.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description: Gateway to the backend api.
 * 
 * Forwards requests to the appropriate APIs
 ******************************************************************************/
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import express from 'express';
import { authenticate } from './middleware/authenticate'
import { errorHandler } from './middleware/errorHandler';
import { createProxyMiddleware } from 'http-proxy-middleware'

const readingsApi = process.env.READINGS_SERVICE ?? "";
const coreApi = process.env.CORE_SERVICE ?? "";

export const app = express();
app.use(authenticate);

app.use('/api/readings', createProxyMiddleware({ 
  target: readingsApi,
  changeOrigin: false,
}))

app.use('/api', createProxyMiddleware({ 
  target: coreApi,
  changeOrigin: false,
}))

app.use(errorHandler)
