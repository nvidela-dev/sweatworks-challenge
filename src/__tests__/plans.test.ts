import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import {
  resetMockDb,
  mockPaginated,
  mockSelect,
} from './helpers/db.mock.js';
import { createPlan, resetUUIDCounter } from './helpers/fixtures.js';

const app = createApp();

describe('Plans API', () => {
  beforeEach(() => {
    resetMockDb();
    resetUUIDCounter();
  });

  describe('GET /api/plans', () => {
    it('returns paginated list of plans', async () => {
      const plans = [createPlan({ name: 'Basic' }), createPlan({ name: 'Premium' })];
      mockPaginated(plans, 2);

      const response = await request(app).get('/api/plans');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        pageSize: 20,
        totalCount: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('returns only active plans when filtered', async () => {
      const activePlan = createPlan({ name: 'Active', isActive: true });
      mockPaginated([activePlan], 1);

      const response = await request(app).get('/api/plans?isActive=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(true);
    });

    it('returns only inactive plans when filtered', async () => {
      const inactivePlan = createPlan({ name: 'Inactive', isActive: false });
      mockPaginated([inactivePlan], 1);

      const response = await request(app).get('/api/plans?isActive=false');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(false);
    });

    it('supports search by name', async () => {
      const plan = createPlan({ name: 'Premium Monthly' });
      mockPaginated([plan], 1);

      const response = await request(app).get('/api/plans?search=premium');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/plans/:id', () => {
    it('returns a plan by id', async () => {
      const plan = createPlan({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Basic' });
      mockSelect([plan]);

      const response = await request(app).get('/api/plans/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(response.body.data.name).toBe('Basic');
    });

    it('returns 404 for nonexistent plan', async () => {
      mockSelect([]);

      const response = await request(app).get('/api/plans/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PLAN_NOT_FOUND');
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).get('/api/plans/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });
});
