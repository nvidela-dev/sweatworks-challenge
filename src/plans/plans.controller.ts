import type { Request, Response, NextFunction } from 'express';
import { planQuerySchema, planIdParamSchema } from '../schemas/plan.schema.js';
import { plansService } from './plans.service.js';

export const plansController = {
  list: (req: Request, res: Response, next: NextFunction): void => {
    const query = planQuerySchema.parse(req.validatedQuery);
    plansService
      .list(query)
      .then((result) => {
        res.json({ success: true, data: result.data, meta: result.meta });
      })
      .catch(next);
  },

  getById: (req: Request, res: Response, next: NextFunction): void => {
    const params = planIdParamSchema.parse(req.validatedParams);
    plansService
      .getById(params.planId)
      .then((plan) => {
        res.json({ success: true, data: plan });
      })
      .catch(next);
  },
};
