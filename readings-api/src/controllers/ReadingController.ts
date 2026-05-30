/*******************************************************************************
 * Filename: ReadingController.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 7th 2026
 * Description: Controller for Readings.
 ******************************************************************************/
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ReadingRepository } from '../repositories/ReadingRepository'

// TODO: Might want to revisit the allowed ranges here
const GetQuerySchema = z.object({
  romAddress: z.coerce.string().min(1),
  range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h')
})

export class ReadingController {

  constructor(private readonly readingRepository: ReadingRepository) {}

  async getLastReadings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = GetQuerySchema.parse(req.query);
      const readings = await this.readingRepository.getLastReadings(
        query.romAddress,
        query.range
      );
      res.json(readings);
    } catch (error) {
      next(error); // Error handler will format zod errors
    }
  }
}


