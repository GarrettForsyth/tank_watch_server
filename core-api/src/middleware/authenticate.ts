/*******************************************************************************
 * Filename: authenticate.ts
 * Project: Tank Watch (Server)
 * Author: Garrett Forsyth
 * Date: May 6th 2026
 * Description:
 *
 * Currently the authentication is stubbed out. In the future, it is expected
 * to use be replaced with something like Clerk. We keep this stub so that 
 * the authentication middleware will be easy to add later.
 ******************************************************************************/
import { Request, Response, NextFunction } from "express";

export function authenticate(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next();
}

