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
import { ReadingRepository } from '../repositories/ReadingRepository';
import { ReadingController } from '../controllers/ReadingController';

export function createReadingsRouter(readingRepository: ReadingRepository) {
  const router = Router();
  const controller = new ReadingController(readingRepository);

  router.get('/', (req, res, next) => {
    controller.getLastReadings(req, res, next);
  });

  return router;
}

