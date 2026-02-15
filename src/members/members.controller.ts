import type { Request, Response, NextFunction } from 'express';
import {
  memberQuerySchema,
  memberIdParamSchema,
  createMemberSchema,
} from '../schemas/member.schema.js';
import { membersService } from './members.service.js';

export const membersController = {
  list: (req: Request, res: Response, next: NextFunction): void => {
    const query = memberQuerySchema.parse(req.validatedQuery);
    membersService
      .list(query)
      .then((result) => {
        res.json({ success: true, data: result.data, meta: result.meta });
      })
      .catch(next);
  },

  getById: (req: Request, res: Response, next: NextFunction): void => {
    const params = memberIdParamSchema.parse(req.validatedParams);
    membersService
      .getById(params.memberId)
      .then((member) => {
        res.json({ success: true, data: member });
      })
      .catch(next);
  },

  create: (req: Request, res: Response, next: NextFunction): void => {
    const input = createMemberSchema.parse(req.validatedBody);
    membersService
      .create(input)
      .then((member) => {
        res.status(201).json({ success: true, data: member });
      })
      .catch(next);
  },
};
