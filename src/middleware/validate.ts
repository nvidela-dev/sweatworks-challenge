import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodType } from 'zod';
import '../types/express.js';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = <T extends ZodType>(
  schema: T,
  source: ValidationSource
): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (source === 'body') req.validatedBody = result.data;
    if (source === 'query') req.validatedQuery = result.data;
    if (source === 'params') req.validatedParams = result.data;

    next();
  };
