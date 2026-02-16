import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  memberQuerySchema,
  memberIdParamSchema,
  createMemberSchema,
} from '../schemas/member.schema.js';
import { membersController } from './members.controller.js';
import { memberCheckInsRouter } from '../check-ins/index.js';

const router = Router();

router.get('/', validate(memberQuerySchema, 'query'), membersController.list);
router.post('/', validate(createMemberSchema, 'body'), membersController.create);
router.get('/:memberId', validate(memberIdParamSchema, 'params'), membersController.getById);
router.use('/:memberId/check-ins', memberCheckInsRouter);

export { router as membersRouter };
