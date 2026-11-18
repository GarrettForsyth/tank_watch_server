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
export const GetReadingsQuery = z.object({
  romAddress: z.string().regex(/^[0-9a-f]{32}$/, 'must be a 32-character hex sensor ID'),
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
      const query = GetReadingsQuery.parse(req.query);
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


