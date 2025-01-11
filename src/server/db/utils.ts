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
  readonly searchColumns?: PgColumn[];
  readonly query?: string;
  readonly simpleSearch?: boolean;
}

export interface PaginationWithEnhanceDataOptions<T, U> {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortDirection?: SortDirection;
  readonly searchColumns?: PgColumn[];
  readonly query?: string;
  readonly simpleSearch?: boolean;
  readonly enhanceDataFn?: (data: T[]) => Promise<U[]>;
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

function searchQueryBuilder(
  columns: PgColumn[],
  query: string,
  simpleSearch = false,
): SQL {
  if (columns.length === 0) {
    throw new Error("No columns provided for search");
  }

  if (simpleSearch) {
    // use like query for simple search
    return sql`(${sql.join(
      columns.map(
        (column) => sql`CAST(${column} AS TEXT) ILIKE ${`%${query}%`}`,
      ),
      sql` OR `,
    )})`;
  }

  if (columns.length === 1) {
    return sql`to_tsvector('english', ${columns[0]}) @@ to_tsquery('english', ${query})`;
  }

  const searchConditions = columns.map((column, index) => {
    const weight = String.fromCharCode(65 + index); // 'A', 'B', 'C', etc.
    return sql`setweight(to_tsvector('english', ${column}), ${weight})`;
  });

  return sql`(${sql.join(searchConditions, sql` || `)}) @@ to_tsquery('english', ${query})`;
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
  searchColumns?: PgColumn[],
  query?: string,
  simpleSearch = false,
): T {
  if (searchColumns && query) {
    const searchCondition = searchQueryBuilder(
      searchColumns,
      query,
      simpleSearch,
    );
    qb = qb.where(searchCondition);
  }

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
    searchColumns = [],
    query,
    simpleSearch = false,
  } = options;

  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);

  // Find the sortable column that matches either sortBy or orderBy parameter
  const sortColumn = sortableColumns.find((col) => col.name === sortBy);

  // Use the matched column or default to the first sortable column, or fallback to a default SQL order
  const orderByColumn = sortColumn
    ? getSortOrder(sortColumn.column, sortDirection)
    : sortableColumns[0]
      ? getSortOrder(sortableColumns[0].column, sortDirection)
      : sql`1`;

  const paginatedQuery = buildPaginatedQuery(
    baseQuery,
    orderByColumn,
    validPage,
    validLimit,
    searchColumns,
    query,
    simpleSearch,
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
  });
}

export async function paginateWithEnhanceData<
  T extends PgSelect,
  InputRow,
  OutputRow,
>(
  baseQuery: T,
  table: PgTable,
  sortableColumns: SortableColumn[],
  options: PaginationWithEnhanceDataOptions<InputRow, OutputRow>,
): Promise<PaginationResult<OutputRow>> {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortDirection = "asc",
    searchColumns = [],
    query,
    simpleSearch = false,
    enhanceDataFn,
  } = options;

  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);

  // Find the sortable column that matches either sortBy or orderBy parameter
  const sortColumn = sortableColumns.find((col) => col.name === sortBy);

  // Use the matched column or default to the first sortable column, or fallback to a default SQL order
  const orderByColumn = sortColumn
    ? getSortOrder(sortColumn.column, sortDirection)
    : sortableColumns[0]
      ? getSortOrder(sortableColumns[0].column, sortDirection)
      : sql`1`;

  const paginatedQuery = buildPaginatedQuery(
    baseQuery,
    orderByColumn,
    validPage,
    validLimit,
    searchColumns,
    query,
    simpleSearch,
  );

  const countQuery = db
    .select({
      total: sql<number>`count(*)::integer`,
    })
    .from(table);

  const [rawData, [countResult]] = await Promise.all([
    paginatedQuery,
    countQuery,
  ]);

  const total = countResult?.total ?? 0;
  const totalPages = Math.ceil(total / validLimit);

  // Apply the enhance function if provided
  const data = enhanceDataFn
    ? await enhanceDataFn(rawData as InputRow[])
    : (rawData as unknown as OutputRow[]);

  return Object.freeze({
    data: data,
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
