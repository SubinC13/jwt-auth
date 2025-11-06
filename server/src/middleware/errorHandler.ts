import { NextFunction, Request, Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(StatusCodes.NOT_FOUND).json({
    error: getReasonPhrase(StatusCodes.NOT_FOUND)
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isKnown = typeof err === 'object' && err !== null && 'status' in (err as any);
  if (isKnown) {
    const e = err as any;
    res.status(e.status).json({ error: e.message || 'Error' });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
  });
}


