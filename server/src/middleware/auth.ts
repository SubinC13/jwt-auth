import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyJwt } from '../utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { userId: string; role: 'admin' | 'customer' };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }
    const payload = verifyJwt(token);
    req.user = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: Array<'admin' | 'customer'>) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
    }
    next();
  };
}


