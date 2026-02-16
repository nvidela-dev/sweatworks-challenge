import type { Request, Response, NextFunction } from 'express';
import {
  checkInQuerySchema,
  checkInIdParamSchema,
  createCheckInSchema,
} from '../schemas/check-in.schema.js';
import { memberIdParamSchema } from '../schemas/member.schema.js';
import { checkInsService } from './check-ins.service.js';

export const checkInsController = {
  list: (req: Request, res: Response, next: NextFunction): void => {
    const query = checkInQuerySchema.parse(req.validatedQuery);
    checkInsService
      .list(query)
      .then((result) => {
        res.json({ success: true, data: result.data, meta: result.meta });
      })
      .catch(next);
  },

  getById: (req: Request, res: Response, next: NextFunction): void => {
    const params = checkInIdParamSchema.parse(req.validatedParams);
    checkInsService
      .getById(params.checkInId)
      .then((checkIn) => {
        res.json({ success: true, data: checkIn });
      })
      .catch(next);
  },

  create: (req: Request, res: Response, next: NextFunction): void => {
    const params = memberIdParamSchema.parse(req.validatedParams);
    const body = createCheckInSchema.parse(req.validatedBody);
    checkInsService
      .create(params.memberId, body.checkedInAt)
      .then((checkIn) => {
        res.status(201).json({ success: true, data: checkIn });
      })
      .catch(next);
  },
};
