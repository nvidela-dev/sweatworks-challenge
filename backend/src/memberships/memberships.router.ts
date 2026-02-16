import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  membershipQuerySchema,
  membershipIdParamSchema,
  createMembershipSchema,
  cancelMembershipSchema,
} from '../schemas/membership.schema.js';
import { membershipsController } from './memberships.controller.js';

const router = Router();

router.get('/', validate(membershipQuerySchema, 'query'), membershipsController.list);
router.post('/', validate(createMembershipSchema, 'body'), membershipsController.create);
router.get('/:membershipId', validate(membershipIdParamSchema, 'params'), membershipsController.getById);
router.patch('/:membershipId/cancel', validate(membershipIdParamSchema, 'params'), validate(cancelMembershipSchema, 'body'), membershipsController.cancel);

export { router as membershipsRouter };
