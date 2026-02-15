import type { Request, Response } from 'express';
import { Router } from 'express';
import type { ApiSuccessResponse } from '../types/api.types.js';
import { plansRouter } from '../plans/index.js';
import { membersRouter } from '../members/index.js';

const router = Router();

interface HealthCheckData {
  status: 'ok';
  timestamp: string;
}

router.use('/plans', plansRouter);
router.use('/members', membersRouter);

router.get('/health', (_req: Request, res: Response): void => {
  const response: ApiSuccessResponse<HealthCheckData> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
});

export { router as apiRouter };
