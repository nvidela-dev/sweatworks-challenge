// Seed data will be added in PR #5 (Plans API)
// This file will populate the plans table with initial data

import { pool } from './client';

async function seed() {
  console.log('Seeding database...');

  // TODO: Add seed data in PR #5

  console.log('Seeding completed');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
