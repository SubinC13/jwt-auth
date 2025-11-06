import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'ValidationError',
          details: err.flatten()
        });
      }
      next(err);
    }
  };
}


