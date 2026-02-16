import type { Request, Response, NextFunction } from 'express';
import {
  membershipQuerySchema,
  membershipIdParamSchema,
  createMembershipSchema,
  cancelMembershipSchema,
} from '../schemas/membership.schema.js';
import { membershipsService } from './memberships.service.js';

export const membershipsController = {
  list: (req: Request, res: Response, next: NextFunction): void => {
    const query = membershipQuerySchema.parse(req.validatedQuery);
    membershipsService
      .list(query)
      .then((result) => {
        res.json({ success: true, data: result.data, meta: result.meta });
      })
      .catch(next);
  },

  getById: (req: Request, res: Response, next: NextFunction): void => {
    const params = membershipIdParamSchema.parse(req.validatedParams);
    membershipsService
      .getById(params.membershipId)
      .then((membership) => {
        res.json({ success: true, data: membership });
      })
      .catch(next);
  },

  create: (req: Request, res: Response, next: NextFunction): void => {
    const input = createMembershipSchema.parse(req.validatedBody);
    membershipsService
      .create(input)
      .then((membership) => {
        res.status(201).json({ success: true, data: membership });
      })
      .catch(next);
  },

  cancel: (req: Request, res: Response, next: NextFunction): void => {
    const params = membershipIdParamSchema.parse(req.validatedParams);
    const input = cancelMembershipSchema.parse(req.validatedBody);
    membershipsService
      .cancel(params.membershipId, input)
      .then((membership) => {
        res.json({ success: true, data: membership });
      })
      .catch(next);
  },
};
