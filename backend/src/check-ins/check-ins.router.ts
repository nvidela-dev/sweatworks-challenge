import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  checkInQuerySchema,
  checkInIdParamSchema,
  createCheckInBodySchema,
} from '../schemas/check-in.schema.js';
import { memberIdParamSchema } from '../schemas/member.schema.js';
import { checkInsController } from './check-ins.controller.js';

// Main check-ins router: /api/check-ins
const router = Router();

/**
 * @openapi
 * /check-ins:
 *   get:
 *     summary: List all check-ins
 *     tags: [Check-ins]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by member ID
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter check-ins from this date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter check-ins until this date
 *     responses:
 *       200:
 *         description: Paginated list of check-ins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CheckIn'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', validate(checkInQuerySchema, 'query'), checkInsController.list);

/**
 * @openapi
 * /check-ins/{checkInId}:
 *   get:
 *     summary: Get a check-in by ID
 *     tags: [Check-ins]
 *     parameters:
 *       - in: path
 *         name: checkInId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Check-in ID
 *     responses:
 *       200:
 *         description: Check-in details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CheckIn'
 *       404:
 *         description: Check-in not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:checkInId', validate(checkInIdParamSchema, 'params'), checkInsController.getById);

export { router as checkInsRouter };

// Nested router for member check-ins: /api/members/:memberId/check-ins
const memberCheckInsRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /members/{memberId}/check-ins:
 *   post:
 *     summary: Record a check-in for a member
 *     tags: [Check-ins]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCheckInInput'
 *     responses:
 *       201:
 *         description: Check-in recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CheckIn'
 *       400:
 *         description: Member does not have an active membership
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
memberCheckInsRouter.post(
  '/',
  validate(memberIdParamSchema, 'params'),
  validate(createCheckInBodySchema, 'body'),
  checkInsController.create
);

export { memberCheckInsRouter };
