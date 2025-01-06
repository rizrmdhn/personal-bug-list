import { type SQL, asc, sql } from "drizzle-orm";
import {
  type PgTable,
  type PgColumn,
  type PgSelect,
} from "drizzle-orm/pg-core";
import { db } from ".";

export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  totalPages: number;
  pages: (number | string)[]; // Can be number or "..." string
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
  orderBy?: PgColumn | SQL | SQL.Aliased;
};

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  // Show all pages if total pages is 7 or less
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  // Calculate range around current page
  let rangeStart = Math.max(2, currentPage - 1);
  let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  // Adjust range if at the edges
  if (currentPage <= 3) {
    rangeEnd = 4;
  }
  if (currentPage >= totalPages - 2) {
    rangeStart = totalPages - 3;
  }

  // Add range numbers
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}

function buildPaginatedQuery<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  limit = 10,
) {
  return qb
    .orderBy(orderByColumn)
    .limit(limit)
    .offset((page - 1) * limit);
}

export async function paginate<T extends PgSelect, R>(
  baseQuery: T,
  table: PgTable,
  options: PaginationOptions = {},
): Promise<PaginationResult<R>> {
  const { page = 1, limit = 10, orderBy } = options;

  // Ensure we have valid pagination parameters
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);

  // Build the paginated query for data
  const paginatedQuery = buildPaginatedQuery(
    baseQuery,
    orderBy ?? asc(baseQuery as unknown as PgColumn),
    validPage,
    validLimit,
  );

  // Create a count query using SQL template literal
  const countQuery = db
    .select({
      total: sql<number>`count(*)::integer`,
    })
    .from(table);

  // Execute both queries in parallel
  const [data, [countResult]] = await Promise.all([paginatedQuery, countQuery]);

  const total = countResult?.total ?? 0;
  const totalPages = Math.ceil(total / validLimit);

  // Generate the pages array
  const pages = generatePageNumbers(validPage, totalPages);

  return {
    data: data as R[],
    total,
    page: validPage,
    limit: validLimit,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    currentPage: validPage,
    totalPages,
    pages,
  };
}
