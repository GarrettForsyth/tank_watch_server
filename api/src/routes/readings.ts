/*******************************************************************************
 * Filename: readings.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description:
 *
 * Endpoints for the readings route.
 ******************************************************************************/
import { Router } from 'express'

export const readingsRouter = Router();

readingsRouter.get('/', (_req, res) => {
  res.json({ message: 'TODO: Add get readings'})
});
