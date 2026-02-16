import { vi } from 'vitest';

type MockResult = unknown[];

interface QueryCall {
  type: 'select' | 'insert' | 'update' | 'delete';
  table?: string;
  conditions?: unknown[];
  values?: unknown;
}

// Track all query calls for assertions
let queryCalls: QueryCall[] = [];

// Queue-based results with table context
interface QueuedResult {
  table?: string;
  result: MockResult;
}

let selectQueue: QueuedResult[] = [];
let insertQueue: QueuedResult[] = [];
let updateQueue: QueuedResult[] = [];

/**
 * Reset mock state between tests
 */
export function resetMockDb(): void {
  selectQueue = [];
  insertQueue = [];
  updateQueue = [];
  queryCalls = [];
  vi.clearAllMocks();
}

/**
 * Get all query calls made during the test (for assertions)
 */
export function getQueryCalls(): QueryCall[] {
  return [...queryCalls];
}

/**
 * Get query calls filtered by type
 */
export function getSelectCalls(): QueryCall[] {
  return queryCalls.filter((c) => c.type === 'select');
}

export function getInsertCalls(): QueryCall[] {
  return queryCalls.filter((c) => c.type === 'insert');
}

export function getUpdateCalls(): QueryCall[] {
  return queryCalls.filter((c) => c.type === 'update');
}

/**
 * Queue a result for the next select query
 * @param result - The result to return
 * @param table - Optional table name for matching (if not provided, uses FIFO)
 */
export function mockSelect(result: MockResult, table?: string): void {
  selectQueue.push({ result, table });
}

/**
 * Queue a result for the next insert query
 */
export function mockInsert(result: MockResult, table?: string): void {
  insertQueue.push({ result, table });
}

/**
 * Queue a result for the next update query
 */
export function mockUpdate(result: MockResult, table?: string): void {
  updateQueue.push({ result, table });
}

/**
 * Queue multiple select results at once (FIFO order)
 */
export function mockSelectMultiple(results: MockResult[]): void {
  results.forEach((result) => selectQueue.push({ result }));
}

/**
 * Configure both select queries for paginated endpoints (data + count)
 */
export function mockPaginated(data: MockResult, total: number): void {
  selectQueue.push({ result: data });
  selectQueue.push({ result: [{ count: total }] });
}

// Get next result from queue, optionally matching by table
function getNextSelectResult(tableName?: string): MockResult {
  // If table name provided, try to find matching result first
  if (tableName) {
    const matchIndex = selectQueue.findIndex((q) => q.table === tableName);
    if (matchIndex !== -1) {
      const match = selectQueue.splice(matchIndex, 1)[0];
      return match?.result ?? [];
    }
  }
  // Fall back to FIFO
  return selectQueue.shift()?.result ?? [];
}

function getNextInsertResult(tableName?: string): MockResult {
  if (tableName) {
    const matchIndex = insertQueue.findIndex((q) => q.table === tableName);
    if (matchIndex !== -1) {
      const match = insertQueue.splice(matchIndex, 1)[0];
      return match?.result ?? [];
    }
  }
  return insertQueue.shift()?.result ?? [];
}

function getNextUpdateResult(tableName?: string): MockResult {
  if (tableName) {
    const matchIndex = updateQueue.findIndex((q) => q.table === tableName);
    if (matchIndex !== -1) {
      const match = updateQueue.splice(matchIndex, 1)[0];
      return match?.result ?? [];
    }
  }
  return updateQueue.shift()?.result ?? [];
}

// Extract table name from drizzle table object
function extractTableName(tableObj: unknown): string | undefined {
  if (tableObj && typeof tableObj === 'object') {
    // Drizzle tables have a Symbol or property with the table name
    const obj = tableObj as Record<string, unknown>;
    if (typeof obj._ === 'object' && obj._ !== null) {
      const meta = obj._ as Record<string, unknown>;
      if (typeof meta.name === 'string') {
        return meta.name;
      }
    }
    // Fallback: try to get constructor name or any name property
    if ('name' in obj && typeof obj.name === 'string') {
      return obj.name;
    }
  }
  return undefined;
}

// Create a proper promise-like chain that captures result on 'from'
function createSelectChain() {
  let capturedResult: MockResult | null = null;
  let tableName: string | undefined;
  const conditions: unknown[] = [];

  const chain = {
    from: vi.fn().mockImplementation((table: unknown) => {
      tableName = extractTableName(table);
      capturedResult = getNextSelectResult(tableName);
      return chain;
    }),
    where: vi.fn().mockImplementation((condition: unknown) => {
      conditions.push(condition);
      return chain;
    }),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T, onRejected?: (reason: unknown) => T) => {
        // Record the query call
        queryCalls.push({
          type: 'select',
          table: tableName,
          conditions: conditions.length > 0 ? conditions : undefined,
        });

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
  let tableName: string | undefined;
  let insertedValues: unknown;

  const chain = {
    values: vi.fn().mockImplementation((vals: unknown) => {
      insertedValues = vals;
      return chain;
    }),
    returning: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T, onRejected?: (reason: unknown) => T) => {
        // Record the query call
        queryCalls.push({
          type: 'insert',
          table: tableName,
          values: insertedValues,
        });

        const result = getNextInsertResult(tableName);
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

  // Capture table name when insert is called
  const originalChain = chain;
  return {
    ...originalChain,
    _setTable: (table: string | undefined) => {
      tableName = table;
    },
  };
}

// Create chainable query builder for UPDATE
function createUpdateChain() {
  let tableName: string | undefined;
  const conditions: unknown[] = [];

  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation((condition: unknown) => {
      conditions.push(condition);
      return chain;
    }),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T, onRejected?: (reason: unknown) => T) => {
        // Record the query call
        queryCalls.push({
          type: 'update',
          table: tableName,
          conditions: conditions.length > 0 ? conditions : undefined,
        });

        const result = getNextUpdateResult(tableName);
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

  return {
    ...chain,
    _setTable: (table: string | undefined) => {
      tableName = table;
    },
  };
}

// Create chainable query builder for DELETE
function createDeleteChain() {
  let tableName: string | undefined;
  const conditions: unknown[] = [];

  const chain = {
    where: vi.fn().mockImplementation((condition: unknown) => {
      conditions.push(condition);
      return chain;
    }),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(
      <T>(onFulfilled?: (value: MockResult) => T) => {
        queryCalls.push({
          type: 'delete',
          table: tableName,
          conditions: conditions.length > 0 ? conditions : undefined,
        });

        const result: MockResult = [];
        const transformed = onFulfilled ? onFulfilled(result) : result;
        return Promise.resolve(transformed);
      }
    ),
    catch: vi.fn().mockReturnThis(),
  };

  return {
    ...chain,
    _setTable: (table: string | undefined) => {
      tableName = table;
    },
  };
}

// The mock db object
export const db = {
  select: vi.fn().mockImplementation(() => createSelectChain()),
  insert: vi.fn().mockImplementation((table: unknown) => {
    const chain = createInsertChain();
    chain._setTable(extractTableName(table));
    return chain;
  }),
  update: vi.fn().mockImplementation((table: unknown) => {
    const chain = createUpdateChain();
    chain._setTable(extractTableName(table));
    return chain;
  }),
  delete: vi.fn().mockImplementation((table: unknown) => {
    const chain = createDeleteChain();
    chain._setTable(extractTableName(table));
    return chain;
  }),
};

// Mock pool for migrations/seeds (not used in tests)
export const pool = {
  end: vi.fn(),
};
