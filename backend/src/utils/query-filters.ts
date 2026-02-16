import type { SQL } from 'drizzle-orm';

export function buildConditions(
  filters: [unknown, () => SQL | undefined][]
): SQL[] {
  return filters
    .filter(([value]) => Boolean(value))
    .map(([, build]) => build())
    .filter((condition): condition is SQL => condition !== undefined);
}
