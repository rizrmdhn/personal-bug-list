import { type SQL, asc, desc, sql } from "drizzle-orm";
import {
  type PgTable,
  type PgColumn,
  type PgSelect,
} from "drizzle-orm/pg-core";
import { db } from ".";

export interface PaginationResult<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly pages: (number | "...")[];
  readonly sortBy?: string;
  readonly sortDirection?: SortDirection;
  readonly orderBy?: string;
  readonly orderDirection?: SortDirection;
}

export interface CursorPaginationResult<T> {
  readonly data: T[];
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

export type SortDirection = "asc" | "desc";

export interface SortableColumn {
  column: PgColumn;
  name: string;
}

export interface PaginationOptions {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortDirection?: SortDirection;
  readonly orderBy?: string;
  readonly orderDirection?: SortDirection;
}

type PaginationDirection = "forward" | "backward";

export interface CursorPaginationResult<T> {
  readonly data: T[];
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

export interface CursorPaginationInput {
  readonly cursor?: string;
  readonly limit: number;
  readonly direction: PaginationDirection;
}

interface CursorQueryOptions {
  readonly cursorColumn: PgColumn;
  readonly cursor?: string;
  readonly limit: number;
  readonly direction: PaginationDirection;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "..."> = [];
  pages.push(1);

  if (currentPage > 3) {
    pages.push("...");
  }

  let rangeStart = Math.max(2, currentPage - 1);
  let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    rangeEnd = 4;
  }
  if (currentPage >= totalPages - 2) {
    rangeStart = totalPages - 3;
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

function getSortOrder(
  column: PgColumn,
  direction: SortDirection = "asc",
): SQL | SQL.Aliased {
  return direction === "asc" ? asc(column) : desc(column);
}

function buildPaginatedQuery<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  limit = 10,
): T {
  return qb
    .orderBy(orderByColumn)
    .limit(limit)
    .offset((page - 1) * limit);
}

export async function paginate<
  T extends PgSelect,
  R extends Record<string, unknown>,
>(
  baseQuery: T,
  table: PgTable,
  sortableColumns: SortableColumn[],
  options: PaginationOptions = {},
): Promise<PaginationResult<R>> {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortDirection = "asc",
    orderBy,
    orderDirection = "asc",
  } = options;

  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);

  // Find the sortable column that matches either sortBy or orderBy parameter
  const sortColumn = sortableColumns.find(
    (col) => col.name === (orderBy ?? sortBy),
  );

  // Use the matched column or default to the first sortable column, or fallback to a default SQL order
  const orderByColumn = sortColumn
    ? getSortOrder(sortColumn.column, orderDirection || sortDirection)
    : sortableColumns[0]
      ? getSortOrder(sortableColumns[0].column, orderDirection || sortDirection)
      : sql`1`;

  const paginatedQuery = buildPaginatedQuery(
    baseQuery,
    orderByColumn,
    validPage,
    validLimit,
  );

  const countQuery = db
    .select({
      total: sql<number>`count(*)::integer`,
    })
    .from(table);

  const [data, [countResult]] = await Promise.all([paginatedQuery, countQuery]);

  const total = countResult?.total ?? 0;
  const totalPages = Math.ceil(total / validLimit);

  return Object.freeze({
    data: data as R[],
    total,
    page: validPage,
    limit: validLimit,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
    currentPage: validPage,
    totalPages,
    pages: generatePageNumbers(validPage, totalPages),
    sortBy: sortColumn?.name,
    sortDirection,
    orderBy: sortColumn?.name,
    orderDirection,
  });
}

function encodeCursor(value: string | number | Date): string {
  if (value instanceof Date) {
    return Buffer.from(value.toISOString()).toString("base64");
  }
  return Buffer.from(String(value)).toString("base64");
}

function decodeCursor(cursor: string): string {
  try {
    return Buffer.from(cursor, "base64").toString("utf-8");
  } catch {
    throw new Error("Invalid cursor format");
  }
}

function buildCursorQuery<T extends PgSelect>(
  qb: T,
  options: CursorQueryOptions,
): T {
  const { cursorColumn, cursor, limit, direction } = options;
  let query = qb;

  if (cursor) {
    try {
      const decodedCursor = decodeCursor(cursor);
      const operator = direction === "forward" ? ">" : "<";
      query = query.where(
        sql`${cursorColumn} ${sql.raw(operator)} ${sql.raw(`'${decodedCursor}'`)}::timestamptz`,
      );
    } catch (error) {
      console.error("Cursor decode error:", error);
      throw new Error(
        `Invalid cursor format: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return query
    .orderBy(direction === "forward" ? asc(cursorColumn) : desc(cursorColumn))
    .limit(limit + 1);
}

export async function paginateWithCursor<
  T extends PgSelect,
  R extends Record<string, unknown> & Record<P, string>,
  P extends string,
>(
  baseQuery: T,
  cursorColumn: PgColumn & { name: string },
  input: CursorPaginationInput,
): Promise<CursorPaginationResult<R>> {
  const { cursor, limit, direction } = input;
  const validLimit = Math.max(1, limit);

  try {
    const query = buildCursorQuery(baseQuery, {
      cursorColumn,
      cursor,
      limit: validLimit,
      direction,
    });

    const results = await query;
    const hasNextPage = results.length > validLimit;
    const items = results.slice(0, validLimit) as R[];

    // Convert snake_case column name to camelCase for accessing the result
    const camelCaseProperty = cursorColumn.name
      .split("_")
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join("") as P;

    const nextCursor =
      hasNextPage && items.length > 0
        ? encodeCursor(items[items.length - 1]?.[camelCaseProperty] ?? "")
        : null;

    return Object.freeze({
      data: items,
      nextCursor,
      prevCursor: cursor ?? null,
      hasNextPage,
      hasPrevPage: !!cursor,
    });
  } catch (error) {
    console.error("Pagination error:", error);
    throw new Error(
      `Failed to fetch data: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
