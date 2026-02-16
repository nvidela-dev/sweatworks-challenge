import { vi } from 'vitest';

type MockResult = unknown[];

// Queue-based approach for handling multiple queries
let selectQueue: MockResult[] = [];
let insertQueue: MockResult[] = [];
let updateQueue: MockResult[] = [];

/**
 * Reset mock state between tests
 */
export function resetMockDb(): void {
  selectQueue = [];
  insertQueue = [];
  updateQueue = [];
}

/**
 * Queue a result for the next select query
 */
export function mockSelect(result: MockResult): void {
  selectQueue.push(result);
}

/**
 * Queue a result for the next insert query
 */
export function mockInsert(result: MockResult): void {
  insertQueue.push(result);
}

/**
 * Queue a result for the next update query
 */
export function mockUpdate(result: MockResult): void {
  updateQueue.push(result);
}

/**
 * Queue multiple select results at once
 */
export function mockSelectMultiple(results: MockResult[]): void {
  selectQueue.push(...results);
}

/**
 * Configure both select queries for paginated endpoints (data + count)
 */
export function mockPaginated(data: MockResult, total: number): void {
  selectQueue.push(data);
  selectQueue.push([{ count: total }]);
}

// Get next result from queue or return empty array
function getNextSelectResult(): MockResult {
  return selectQueue.shift() ?? [];
}

function getNextInsertResult(): MockResult {
  return insertQueue.shift() ?? [];
}

function getNextUpdateResult(): MockResult {
  return updateQueue.shift() ?? [];
}

// Create a proper promise-like chain that captures result on 'from'
function createSelectChain() {
  let capturedResult: MockResult | null = null;

  const chain = {
    from: vi.fn().mockImplementation(() => {
      // Capture result when 'from' is called
      capturedResult = getNextSelectResult();
      return chain;
    }),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    // Implement then as a proper thenable
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T, onRejected?: (reason: unknown) => T) => {
        const result = capturedResult ?? [];
        try {
          const transformed = onFulfilled ? onFulfilled(result) : result;
          return Promise.resolve(transformed);
        } catch (error) {
          if (onRejected) {
            return Promise.resolve(onRejected(error));
          }
          return Promise.reject(error);
        }
      }
    ),
    catch: vi.fn().mockImplementation((onRejected: (reason: unknown) => unknown) => {
      return Promise.resolve(capturedResult ?? []).catch(onRejected);
    }),
  };

  return chain;
}

// Create chainable query builder for INSERT
function createInsertChain() {
  const chain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T, onRejected?: (reason: unknown) => T) => {
        const result = getNextInsertResult();
        try {
          const transformed = onFulfilled ? onFulfilled(result) : result;
          return Promise.resolve(transformed);
        } catch (error) {
          if (onRejected) {
            return Promise.resolve(onRejected(error));
          }
          return Promise.reject(error);
        }
      }
    ),
    catch: vi.fn().mockReturnThis(),
  };

  return chain;
}

// Create chainable query builder for UPDATE
function createUpdateChain() {
  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T, onRejected?: (reason: unknown) => T) => {
        const result = getNextUpdateResult();
        try {
          const transformed = onFulfilled ? onFulfilled(result) : result;
          return Promise.resolve(transformed);
        } catch (error) {
          if (onRejected) {
            return Promise.resolve(onRejected(error));
          }
          return Promise.reject(error);
        }
      }
    ),
    catch: vi.fn().mockReturnThis(),
  };

  return chain;
}

// Create chainable query builder for DELETE
function createDeleteChain() {
  const chain = {
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T) => {
        const result: MockResult = [];
        const transformed = onFulfilled ? onFulfilled(result) : result;
        return Promise.resolve(transformed);
      }
    ),
    catch: vi.fn().mockReturnThis(),
  };

  return chain;
}

// The mock db object
export const db = {
  select: vi.fn().mockImplementation(() => createSelectChain()),
  insert: vi.fn().mockImplementation(() => createInsertChain()),
  update: vi.fn().mockImplementation(() => createUpdateChain()),
  delete: vi.fn().mockImplementation(() => createDeleteChain()),
};

// Mock pool for migrations/seeds (not used in tests)
export const pool = {
  end: vi.fn(),
};
