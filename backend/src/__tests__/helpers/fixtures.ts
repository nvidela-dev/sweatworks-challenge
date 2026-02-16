import type { Member } from '../../db/schema/members.js';
import type { Plan } from '../../db/schema/plans.js';
import type { Membership } from '../../db/schema/memberships.js';
import type { CheckIn } from '../../db/schema/check-ins.js';

// Helper to generate UUIDs for tests
let uuidCounter = 0;
export function generateUUID(): string {
  uuidCounter++;
  return `00000000-0000-0000-0000-${String(uuidCounter).padStart(12, '0')}`;
}

export function resetUUIDCounter(): void {
  uuidCounter = 0;
}

// Factory for creating test members
export function createMember(overrides: Partial<Member> = {}): Member {
  const id = overrides.id ?? generateUUID();
  return {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe.${id.slice(-4)}@example.com`,
    phone: '+1-555-0100',
    isDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

// Factory for creating test plans
export function createPlan(overrides: Partial<Plan> = {}): Plan {
  const id = overrides.id ?? generateUUID();
  return {
    id,
    name: 'Basic Monthly',
    description: 'Access to gym facilities',
    priceCents: 2999,
    durationDays: 30,
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

// Factory for creating test memberships
export function createMembership(overrides: Partial<Membership> = {}): Membership {
  const id = overrides.id ?? generateUUID();
  return {
    id,
    memberId: overrides.memberId ?? generateUUID(),
    planId: overrides.planId ?? generateUUID(),
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    cancelledAt: null,
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

// Factory for creating test check-ins
export function createCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  const id = overrides.id ?? generateUUID();
  return {
    id,
    memberId: overrides.memberId ?? generateUUID(),
    membershipId: overrides.membershipId ?? generateUUID(),
    checkedInAt: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  };
}

// Factory for creating member profile response
export function createMemberProfile(
  member: Member,
  activeMembership: (Membership & { plan: Plan }) | null = null,
  lastCheckIn: Date | null = null,
  checkInsLast30Days: number = 0
) {
  return {
    member,
    activeMembership,
    lastCheckIn,
    checkInsLast30Days,
  };
}

// Common test data sets
export const testMembers = {
  active: () => createMember({ firstName: 'Active', lastName: 'Member' }),
  deleted: () => createMember({ firstName: 'Deleted', lastName: 'Member', isDeleted: true }),
};

export const testPlans = {
  active: () => createPlan({ name: 'Active Plan', isActive: true }),
  inactive: () => createPlan({ name: 'Inactive Plan', isActive: false }),
};

export const testMemberships = {
  active: (memberId: string, planId: string) =>
    createMembership({ memberId, planId, status: 'active' }),
  cancelled: (memberId: string, planId: string) =>
    createMembership({ memberId, planId, status: 'cancelled', cancelledAt: '2024-01-15' }),
  expired: (memberId: string, planId: string) =>
    createMembership({ memberId, planId, status: 'expired' }),
};
