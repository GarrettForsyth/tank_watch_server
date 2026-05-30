/*******************************************************************************
 * Filename: errorHandler.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description: Generic error handler.
 *
 * Always returns validation errors; More error details returned in dev env.
 ******************************************************************************/
import { Request, Response, NextFunction } from "express";
import { ZodError } from 'zod'

const isDev = process.env.NOD_ENV === 'development';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.log(error)

  // Return any zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      issues: error.issues.map(issue => ({
        field: issue.path.map(p => String(p)).join('.'),
        message: issue.message
      }))
    })
    return;
  }

  // Return more error details in the dev environment
  if (isDev) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  } else {
    res.status(500).json({
      error: "An unexpected error occured"
    })
  }
}
