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

/**
 * @openapi
 * /memberships:
 *   get:
 *     summary: List all memberships
 *     tags: [Memberships]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, cancelled, expired]
 *         description: Filter by membership status
 *     responses:
 *       200:
 *         description: Paginated list of memberships
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
 *                     $ref: '#/components/schemas/Membership'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', validate(membershipQuerySchema, 'query'), membershipsController.list);

/**
 * @openapi
 * /memberships:
 *   post:
 *     summary: Create a new membership
 *     tags: [Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMembershipInput'
 *     responses:
 *       201:
 *         description: Membership created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Member or plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Member already has an active membership
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', validate(createMembershipSchema, 'body'), membershipsController.create);

/**
 * @openapi
 * /memberships/{membershipId}:
 *   get:
 *     summary: Get a membership by ID
 *     tags: [Memberships]
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: Membership details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       404:
 *         description: Membership not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:membershipId', validate(membershipIdParamSchema, 'params'), membershipsController.getById);

/**
 * @openapi
 * /memberships/{membershipId}/cancel:
 *   patch:
 *     summary: Cancel a membership
 *     tags: [Memberships]
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Membership ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Cancellation timestamp (defaults to now)
 *     responses:
 *       200:
 *         description: Membership cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Membership'
 *       400:
 *         description: Membership is not active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Membership not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch('/:membershipId/cancel', validate(membershipIdParamSchema, 'params'), validate(cancelMembershipSchema, 'body'), membershipsController.cancel);

export { router as membershipsRouter };
