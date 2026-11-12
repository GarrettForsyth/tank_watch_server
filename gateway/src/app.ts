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

// Only these core-api route groups are client-facing. Everything else on
// core-api (e.g. /internal/*, used service-to-service by the consumer) must
// not be reachable through the gateway.
const PUBLIC_CORE_PREFIXES = ['/devices', '/sensors', '/notifications'];

function isPublicCoreRoute(path: string): boolean {
  return PUBLIC_CORE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

app.use('/api', (req, res, next) => {
  if (isPublicCoreRoute(req.path)) return next();
  res.status(404).json({ error: 'Not found' });
}, createProxyMiddleware({
  target: coreApi,
  changeOrigin: false,
}))

app.use(errorHandler)
