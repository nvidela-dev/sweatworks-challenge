import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import {
  resetMockDb,
  mockPaginated,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockSelectMultiple,
} from './helpers/db.mock.js';
import {
  createMember,
  createMembership,
  createPlan,
  resetUUIDCounter,
} from './helpers/fixtures.js';

const app = createApp();

describe('Memberships API', () => {
  beforeEach(() => {
    resetMockDb();
    resetUUIDCounter();
  });

  describe('GET /api/memberships', () => {
    it('returns paginated list of memberships', async () => {
      const memberships = [
        createMembership({ status: 'active' }),
        createMembership({ status: 'expired' }),
      ];
      mockPaginated(memberships, 2);

      const response = await request(app).get('/api/memberships');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        pageSize: 20,
        totalCount: 2,
      });
    });

    it('filters by memberId', async () => {
      const memberId = '123e4567-e89b-12d3-a456-426614174000';
      const membership = createMembership({ memberId });
      mockPaginated([membership], 1);

      const response = await request(app).get(`/api/memberships?memberId=${memberId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('filters by planId', async () => {
      const planId = '123e4567-e89b-12d3-a456-426614174000';
      const membership = createMembership({ planId });
      mockPaginated([membership], 1);

      const response = await request(app).get(`/api/memberships?planId=${planId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('filters by status', async () => {
      const membership = createMembership({ status: 'active' });
      mockPaginated([membership], 1);

      const response = await request(app).get('/api/memberships?status=active');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('active');
    });

    it('validates startDateFrom <= startDateTo', async () => {
      const response = await request(app).get(
        '/api/memberships?startDateFrom=2024-12-31&startDateTo=2024-01-01'
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
      expect(response.body.error.details[0].field).toBe('startDateFrom');
    });
  });

  describe('GET /api/memberships/:id', () => {
    it('returns a membership by id', async () => {
      const membership = createMembership({
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'active',
      });
      mockSelect([membership]);

      const response = await request(app).get('/api/memberships/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('returns 404 for nonexistent membership', async () => {
      mockSelect([]);

      const response = await request(app).get('/api/memberships/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MEMBERSHIP_NOT_FOUND');
    });
  });

  describe('POST /api/memberships', () => {
    const validMemberId = '123e4567-e89b-12d3-a456-426614174001';
    const validPlanId = '123e4567-e89b-12d3-a456-426614174002';

    it('creates membership with valid input', async () => {
      const member = createMember({ id: validMemberId });
      const plan = createPlan({ id: validPlanId, durationDays: 30, isActive: true });
      const newMembership = createMembership({
        memberId: validMemberId,
        planId: validPlanId,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      // Mock member lookup, plan lookup, active membership check, insert
      mockSelectMultiple([
        [member], // member exists
        [plan], // plan exists
        [], // no active membership
      ]);
      mockInsert([newMembership]);

      const response = await request(app)
        .post('/api/memberships')
        .send({
          memberId: validMemberId,
          planId: validPlanId,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.memberId).toBe(validMemberId);
      expect(response.body.data.planId).toBe(validPlanId);
      expect(response.body.data.status).toBe('active');
    });

    it('auto-calculates endDate from plan durationDays when not provided', async () => {
      const member = createMember({ id: validMemberId });
      const plan = createPlan({ id: validPlanId, durationDays: 30, isActive: true });
      const newMembership = createMembership({
        memberId: validMemberId,
        planId: validPlanId,
        startDate: '2024-01-01',
        endDate: '2024-01-31', // 30 days from start
      });

      mockSelectMultiple([
        [member],
        [plan],
        [],
      ]);
      mockInsert([newMembership]);

      const response = await request(app)
        .post('/api/memberships')
        .send({
          memberId: validMemberId,
          planId: validPlanId,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.endDate).toBe('2024-01-31');
    });

    it('returns 404 if member does not exist', async () => {
      mockSelectMultiple([
        [], // member not found
      ]);

      const response = await request(app)
        .post('/api/memberships')
        .send({
          memberId: validMemberId,
          planId: validPlanId,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('MEMBER_NOT_FOUND');
    });

    it('returns 404 if plan does not exist', async () => {
      const member = createMember({ id: validMemberId });
      mockSelectMultiple([
        [member], // member exists
        [], // plan not found
      ]);

      const response = await request(app)
        .post('/api/memberships')
        .send({
          memberId: validMemberId,
          planId: validPlanId,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('PLAN_NOT_FOUND');
    });

    it('returns 422 if plan is inactive', async () => {
      const member = createMember({ id: validMemberId });
      const inactivePlan = createPlan({ id: validPlanId, isActive: false });
      mockSelectMultiple([
        [member],
        [inactivePlan],
      ]);

      const response = await request(app)
        .post('/api/memberships')
        .send({
          memberId: validMemberId,
          planId: validPlanId,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('PLAN_INACTIVE');
    });

    it('returns 409 if member already has active membership', async () => {
      const member = createMember({ id: validMemberId });
      const plan = createPlan({ id: validPlanId, isActive: true });
      const existingMembership = createMembership({
        memberId: validMemberId,
        status: 'active',
      });

      mockSelectMultiple([
        [member],
        [plan],
        [existingMembership], // active membership exists
      ]);

      const response = await request(app)
        .post('/api/memberships')
        .send({
          memberId: validMemberId,
          planId: validPlanId,
          startDate: '2024-01-01',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('ACTIVE_MEMBERSHIP_EXISTS');
    });
  });

  describe('PATCH /api/memberships/:id/cancel', () => {
    const membershipId = '123e4567-e89b-12d3-a456-426614174000';

    it('cancels an active membership', async () => {
      const membership = createMembership({
        id: membershipId,
        status: 'active',
      });
      const cancelledMembership = {
        ...membership,
        status: 'cancelled',
        cancelledAt: '2024-01-15',
      };

      mockSelect([membership]);
      mockUpdate([cancelledMembership]);

      const response = await request(app)
        .patch(`/api/memberships/${membershipId}/cancel`)
        .send({ cancelledAt: '2024-01-15' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.cancelledAt).toBe('2024-01-15');
    });

    it('defaults cancelledAt to today if not provided', async () => {
      const membership = createMembership({
        id: membershipId,
        status: 'active',
      });
      const today = new Date().toISOString().slice(0, 10);
      const cancelledMembership = {
        ...membership,
        status: 'cancelled',
        cancelledAt: today,
      };

      mockSelect([membership]);
      mockUpdate([cancelledMembership]);

      const response = await request(app)
        .patch(`/api/memberships/${membershipId}/cancel`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.cancelledAt).toBe(today);
    });

    it('returns 404 for nonexistent membership', async () => {
      mockSelect([]);

      const response = await request(app)
        .patch(`/api/memberships/${membershipId}/cancel`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('MEMBERSHIP_NOT_FOUND');
    });

    it('returns 409 for already cancelled membership', async () => {
      const cancelledMembership = createMembership({
        id: membershipId,
        status: 'cancelled',
        cancelledAt: '2024-01-10',
      });
      mockSelect([cancelledMembership]);

      const response = await request(app)
        .patch(`/api/memberships/${membershipId}/cancel`)
        .send({});

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('MEMBERSHIP_ALREADY_CANCELLED');
    });

    it('returns 409 for expired membership', async () => {
      const expiredMembership = createMembership({
        id: membershipId,
        status: 'expired',
      });
      mockSelect([expiredMembership]);

      const response = await request(app)
        .patch(`/api/memberships/${membershipId}/cancel`)
        .send({});

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('MEMBERSHIP_EXPIRED');
    });
  });
});
