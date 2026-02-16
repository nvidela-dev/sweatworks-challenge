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

/**
 * @openapi
 * /members:
 *   get:
 *     summary: List all members
 *     tags: [Members]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include soft-deleted members
 *     responses:
 *       200:
 *         description: Paginated list of members
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
 *                     $ref: '#/components/schemas/Member'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', validate(memberQuerySchema, 'query'), membersController.list);

/**
 * @openapi
 * /members:
 *   post:
 *     summary: Create a new member
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMemberInput'
 *     responses:
 *       201:
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', validate(createMemberSchema, 'body'), membersController.create);

/**
 * @openapi
 * /members/{memberId}:
 *   get:
 *     summary: Get member profile with stats
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member profile with membership and check-in stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MemberProfile'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:memberId', validate(memberIdParamSchema, 'params'), membersController.getById);

router.use('/:memberId/check-ins', memberCheckInsRouter);

export { router as membersRouter };
