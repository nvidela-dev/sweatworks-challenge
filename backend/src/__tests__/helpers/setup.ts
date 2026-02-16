import { vi } from 'vitest';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.PORT = '3000';

// Mock the db client before any imports
vi.mock('../../db/client.js', () => import('./db.mock.js'));
