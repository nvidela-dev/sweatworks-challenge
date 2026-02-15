import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  memberQuerySchema,
  memberIdParamSchema,
  createMemberSchema,
} from '../schemas/member.schema.js';
import { membersController } from './members.controller.js';

const router = Router();

router.get('/', validate(memberQuerySchema, 'query'), membersController.list);
router.post('/', validate(createMemberSchema, 'body'), membersController.create);
router.get('/:memberId', validate(memberIdParamSchema, 'params'), membersController.getById);

export { router as membersRouter };
