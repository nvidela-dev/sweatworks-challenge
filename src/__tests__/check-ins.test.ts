import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import {
  resetMockDb,
  mockPaginated,
  mockSelect,
  mockInsert,
  mockSelectMultiple,
} from './helpers/db.mock.js';
import {
  createMember,
  createMembership,
  createCheckIn,
  resetUUIDCounter,
} from './helpers/fixtures.js';

const app = createApp();

describe('Check-ins API', () => {
  beforeEach(() => {
    resetMockDb();
    resetUUIDCounter();
  });

  describe('GET /api/check-ins', () => {
    it('returns paginated list of check-ins', async () => {
      const checkIns = [
        createCheckIn({ checkedInAt: new Date('2024-01-15T10:00:00Z') }),
        createCheckIn({ checkedInAt: new Date('2024-01-15T11:00:00Z') }),
      ];
      mockPaginated(checkIns, 2);

      const response = await request(app).get('/api/check-ins');

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
      const checkIn = createCheckIn({ memberId });
      mockPaginated([checkIn], 1);

      const response = await request(app).get(`/api/check-ins?memberId=${memberId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('filters by membershipId', async () => {
      const membershipId = '123e4567-e89b-12d3-a456-426614174000';
      const checkIn = createCheckIn({ membershipId });
      mockPaginated([checkIn], 1);

      const response = await request(app).get(`/api/check-ins?membershipId=${membershipId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('filters by date range', async () => {
      const checkIn = createCheckIn({ checkedInAt: new Date('2024-01-15T10:00:00Z') });
      mockPaginated([checkIn], 1);

      const response = await request(app).get(
        '/api/check-ins?dateFrom=2024-01-01&dateTo=2024-01-31'
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('validates dateFrom <= dateTo', async () => {
      const response = await request(app).get(
        '/api/check-ins?dateFrom=2024-12-31&dateTo=2024-01-01'
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
      expect(response.body.error.details[0].field).toBe('dateFrom');
      expect(response.body.error.details[0].message).toContain('dateFrom must be before or equal to dateTo');
    });
  });

  describe('GET /api/check-ins/:id', () => {
    it('returns a check-in by id', async () => {
      const checkIn = createCheckIn({
        id: '123e4567-e89b-12d3-a456-426614174000',
        checkedInAt: new Date('2024-01-15T10:00:00Z'),
      });
      mockSelect([checkIn]);

      const response = await request(app).get('/api/check-ins/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('returns 404 for nonexistent check-in', async () => {
      mockSelect([]);

      const response = await request(app).get('/api/check-ins/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHECK_IN_NOT_FOUND');
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).get('/api/check-ins/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /api/members/:memberId/check-ins', () => {
    const memberId = '123e4567-e89b-12d3-a456-426614174001';
    const membershipId = '123e4567-e89b-12d3-a456-426614174002';

    it('creates a check-in for member with active membership', async () => {
      const member = createMember({ id: memberId });
      const membership = createMembership({
        id: membershipId,
        memberId,
        status: 'active',
      });
      const newCheckIn = createCheckIn({
        memberId,
        membershipId,
        checkedInAt: new Date(),
      });

      // Mock member lookup, active membership lookup, insert
      mockSelectMultiple([
        [member], // member exists
        [membership], // active membership exists
      ]);
      mockInsert([newCheckIn]);

      const response = await request(app)
        .post(`/api/members/${memberId}/check-ins`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.memberId).toBe(memberId);
      expect(response.body.data.membershipId).toBe(membershipId);
    });

    it('creates a check-in with custom timestamp', async () => {
      const member = createMember({ id: memberId });
      const membership = createMembership({
        id: membershipId,
        memberId,
        status: 'active',
      });
      const customTime = '2024-01-15T14:30:00Z';
      const newCheckIn = createCheckIn({
        memberId,
        membershipId,
        checkedInAt: new Date(customTime),
      });

      mockSelectMultiple([
        [member],
        [membership],
      ]);
      mockInsert([newCheckIn]);

      const response = await request(app)
        .post(`/api/members/${memberId}/check-ins`)
        .send({ checkedInAt: customTime });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('returns 404 if member does not exist', async () => {
      mockSelectMultiple([
        [], // member not found
      ]);

      const response = await request(app)
        .post(`/api/members/${memberId}/check-ins`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('MEMBER_NOT_FOUND');
    });

    it('returns 403 if member is soft-deleted', async () => {
      const deletedMember = createMember({ id: memberId, isDeleted: true });
      mockSelectMultiple([
        [deletedMember], // member found but deleted
      ]);

      const response = await request(app)
        .post(`/api/members/${memberId}/check-ins`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('MEMBER_DELETED');
    });

    it('returns 403 if member has no active membership', async () => {
      const member = createMember({ id: memberId });
      mockSelectMultiple([
        [member], // member exists
        [], // no active membership
      ]);

      const response = await request(app)
        .post(`/api/members/${memberId}/check-ins`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('NO_ACTIVE_MEMBERSHIP');
    });

    it('returns 400 for invalid member UUID', async () => {
      const response = await request(app)
        .post('/api/members/not-a-uuid/check-ins')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });
});
