import type { Express } from 'express';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { HttpError } from './types/http-error.js';
import { ErrorCode } from './types/error.types.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use(express.json());

  app.use('/api', apiRouter);

  app.use((req, _res, next) => {
    next(new HttpError(ErrorCode.NOT_FOUND, `Route ${req.method} ${req.path} not found`, 404));
  });

  app.use(errorHandler);

  return app;
}
