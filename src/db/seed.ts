import { db, pool } from './client.js';
import { plans } from './schema/plans.js';
import { members } from './schema/members.js';

const seedPlans = [
  {
    name: 'Basic Monthly',
    description: 'Access to gym facilities during off-peak hours',
    priceCents: 2999,
    durationDays: 30,
    isActive: true,
  },
  {
    name: 'Standard Monthly',
    description: 'Full access to gym facilities and group classes',
    priceCents: 4999,
    durationDays: 30,
    isActive: true,
  },
  {
    name: 'Premium Monthly',
    description: 'All-inclusive access with personal trainer sessions',
    priceCents: 9999,
    durationDays: 30,
    isActive: true,
  },
  {
    name: 'Annual Basic',
    description: 'Basic plan with annual commitment discount',
    priceCents: 29999,
    durationDays: 365,
    isActive: true,
  },
  {
    name: 'Annual Premium',
    description: 'Premium plan with annual commitment discount',
    priceCents: 99999,
    durationDays: 365,
    isActive: true,
  },
  {
    name: 'Legacy Plan',
    description: 'Discontinued plan',
    priceCents: 1999,
    durationDays: 30,
    isActive: false,
  },
];

const seedMembers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0102',
  },
  {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    phone: '+1-555-0103',
  },
  {
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily.williams@example.com',
    phone: null,
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-0105',
  },
];

async function seed() {
  console.log('Seeding database...');

  await db.insert(plans).values(seedPlans).onConflictDoNothing();
  console.log(`Inserted ${seedPlans.length} plans`);

  await db.insert(members).values(seedMembers).onConflictDoNothing();
  console.log(`Inserted ${seedMembers.length} members`);

  console.log('Seeding completed');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
