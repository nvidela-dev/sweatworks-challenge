import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { planQuerySchema, planIdParamSchema } from '../schemas/plan.schema.js';
import { plansController } from './plans.controller.js';

const router = Router();

router.get('/', validate(planQuerySchema, 'query'), plansController.list);
router.get('/:planId', validate(planIdParamSchema, 'params'), plansController.getById);

export { router as plansRouter };
