import { db, pool } from './client.js';
import { plans } from './schema/plans.js';

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

async function seed() {
  console.log('Seeding database...');

  await db.insert(plans).values(seedPlans).onConflictDoNothing();

  console.log(`Inserted ${seedPlans.length} plans`);
  console.log('Seeding completed');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
