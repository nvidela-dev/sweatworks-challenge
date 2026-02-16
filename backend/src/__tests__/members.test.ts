import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import {
  resetMockDb,
  mockPaginated,
  mockSelect,
  mockInsert,
  mockSelectMultiple,
  getSelectCalls,
  getInsertCalls,
} from './helpers/db.mock.js';
import {
  createMember,
  createMembership,
  createPlan,
  resetUUIDCounter,
} from './helpers/fixtures.js';

const app = createApp();

describe('Members API', () => {
  beforeEach(() => {
    resetMockDb();
    resetUUIDCounter();
  });

  describe('GET /api/members', () => {
    it('returns paginated list of members', async () => {
      const members = [
        createMember({ firstName: 'John', lastName: 'Doe' }),
        createMember({ firstName: 'Jane', lastName: 'Smith' }),
      ];
      mockPaginated(members, 2);

      const response = await request(app).get('/api/members');

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

      // Verify DB queries: data + count
      const selectCalls = getSelectCalls();
      expect(selectCalls).toHaveLength(2);
    });

    it('supports search by name or email', async () => {
      const member = createMember({ firstName: 'John', lastName: 'Doe' });
      mockPaginated([member], 1);

      const response = await request(app).get('/api/members?search=john');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('excludes soft-deleted members by default', async () => {
      const activeMember = createMember({ isDeleted: false });
      mockPaginated([activeMember], 1);

      const response = await request(app).get('/api/members');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isDeleted).toBe(false);
    });

    it('includes soft-deleted members when requested', async () => {
      const members = [
        createMember({ isDeleted: false }),
        createMember({ isDeleted: true }),
      ];
      mockPaginated(members, 2);

      const response = await request(app).get('/api/members?includeDeleted=true');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/members/:id', () => {
    it('returns member profile with membership and check-in data', async () => {
      const member = createMember({ id: '123e4567-e89b-12d3-a456-426614174000' });
      const plan = createPlan();
      const membership = createMembership({
        memberId: member.id,
        planId: plan.id,
        status: 'active',
      });

      // Mock the profile query - findProfileById does multiple queries
      mockSelectMultiple([
        [member], // member query
        [{ ...membership, plan }], // active membership with plan
        [], // last check-in
        [{ count: 5 }], // check-ins count
      ]);

      const response = await request(app).get('/api/members/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.member.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(response.body.data).toHaveProperty('activeMembership');
      expect(response.body.data).toHaveProperty('lastCheckIn');
      expect(response.body.data).toHaveProperty('checkInsLast30Days');
    });

    it('returns 404 for nonexistent member', async () => {
      mockSelectMultiple([[]]);

      const response = await request(app).get('/api/members/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MEMBER_NOT_FOUND');
    });

    it('returns 403 for soft-deleted member', async () => {
      const deletedMember = createMember({
        id: '123e4567-e89b-12d3-a456-426614174000',
        isDeleted: true,
      });
      mockSelectMultiple([
        [deletedMember], // member found but deleted
      ]);

      const response = await request(app).get('/api/members/123e4567-e89b-12d3-a456-426614174000');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MEMBER_DELETED');
    });

    it('returns 400 for invalid UUID', async () => {
      const response = await request(app).get('/api/members/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /api/members', () => {
    it('creates a member with valid input', async () => {
      const newMember = createMember({
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'New',
        lastName: 'Member',
        email: 'new.member@example.com',
      });

      // Mock email check (no existing member)
      mockSelect([]);
      // Mock insert
      mockInsert([newMember]);

      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'New',
          lastName: 'Member',
          email: 'new.member@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('New');
      expect(response.body.data.lastName).toBe('Member');
      expect(response.body.data.email).toBe('new.member@example.com');

      // Verify DB operations: email check + insert
      expect(getSelectCalls()).toHaveLength(1);
      expect(getInsertCalls()).toHaveLength(1);
    });

    it('creates a member with optional phone', async () => {
      const newMember = createMember({
        firstName: 'New',
        lastName: 'Member',
        email: 'new.member@example.com',
        phone: '+1-555-0100',
      });

      mockSelect([]);
      mockInsert([newMember]);

      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'New',
          lastName: 'Member',
          email: 'new.member@example.com',
          phone: '+1-555-0100',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.phone).toBe('+1-555-0100');
    });

    it('returns 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'not-an-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('returns 409 for duplicate email', async () => {
      const existingMember = createMember({ email: 'existing@example.com' });
      mockSelect([existingMember]);

      const response = await request(app)
        .post('/api/members')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'existing@example.com',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });
});
