import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  checkInQuerySchema,
  checkInIdParamSchema,
  createCheckInSchema,
} from '../schemas/check-in.schema.js';
import { memberIdParamSchema } from '../schemas/member.schema.js';
import { checkInsController } from './check-ins.controller.js';

// Main check-ins router: /api/check-ins
const router = Router();

router.get('/', validate(checkInQuerySchema, 'query'), checkInsController.list);
router.get('/:checkInId', validate(checkInIdParamSchema, 'params'), checkInsController.getById);

export { router as checkInsRouter };

// Nested router for member check-ins: /api/members/:memberId/check-ins
const memberCheckInsRouter = Router({ mergeParams: true });

memberCheckInsRouter.post(
  '/',
  validate(memberIdParamSchema, 'params'),
  validate(createCheckInSchema, 'body'),
  checkInsController.create
);

export { memberCheckInsRouter };
