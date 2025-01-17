import {
  useQueryState,
  parseAsInteger,
  type Options,
  parseAsString,
  parseAsBoolean,
} from "nuqs";

interface PaginateParams {
  query: string;
  setQuery: (
    value: string | ((old: string) => string | null) | null,
  ) => Promise<URLSearchParams>;
  page: number;
  setPage: (
    value: number | ((old: number) => number | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  pageSize: number;
  setPageSize: (
    value: number | ((old: number) => number | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  sortBy: string;
  setSortBy: (
    value: string | ((old: string | null) => string | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  sortOrder: "asc" | "desc";
  setSortOrder: (
    value:
      | "asc"
      | "desc"
      | ((old: "asc" | "desc") => "asc" | "desc" | null)
      | null,
  ) => Promise<URLSearchParams>;
  simpleSearch: boolean;
  setSimpleSearch: (
    value: boolean | ((old: boolean) => boolean | null) | null,
  ) => Promise<URLSearchParams>;
}

interface PaginateParamsOptions {
  q?: string;
  pageNumber?: number;
  pageLimit?: number;
  columnSortBy?: string;
  columnSortOrder?: string;
}

/**
 * Custom hook for managing pagination parameters in URL query string
 * @param {Object} options - The options for pagination parameters
 * @param {string} [options.q=""] - Initial search query string
 * @param {number} [options.pageNumber=1] - Initial page number
 * @param {number} [options.pageLimit=10] - Initial page size limit
 * @param {string} [options.columnSortBy="name"] - Initial column to sort by
 * @param {string} [options.columnSortOrder="asc"] - Initial sort order direction
 * @returns {PaginateParams} Object containing pagination state and setter functions
 * @returns {string} returns.query - Current search query
 * @returns {Function} returns.setQuery - Function to update search query
 * @returns {number} returns.page - Current page number
 * @returns {Function} returns.setPage - Function to update page number
 * @returns {number} returns.pageSize - Current page size
 * @returns {Function} returns.setPageSize - Function to update page size
 * @returns {string} returns.sortBy - Current sort column
 * @returns {Function} returns.setSortBy - Function to update sort column
 * @returns {("asc"|"desc")} returns.sortOrder - Current sort order
 * @returns {Function} returns.setSortOrder - Function to update sort order
 * @returns {boolean} returns.simpleSearch - Current simple search state
 * @returns {Function} returns.setSimpleSearch - Function to update simple search state
 */
export default function usePaginateParams({
  q = "",
  pageNumber = 1,
  pageLimit = 10,
  columnSortBy = "name",
  columnSortOrder = "asc",
}: PaginateParamsOptions): PaginateParams {
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault(q),
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(pageNumber),
  );
  const [pageSize, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(pageLimit),
  );
  const [simpleSearch, setSimpleSearch] = useQueryState(
    "simpleSearch",
    parseAsBoolean.withDefault(false),
  );
  const [sortColumn, setSortColumn] = useQueryState("sortBy");
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", {
    defaultValue: "asc",
    parse: (value: string) => value as "asc" | "desc",
    serialize: (value: "asc" | "desc") => value,
  });

  return {
    query,
    setQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortBy: sortColumn ?? columnSortBy,
    setSortBy: setSortColumn,
    sortOrder: sortOrder ?? (columnSortOrder as "asc" | "desc"),
    setSortOrder,
    simpleSearch,
    setSimpleSearch,
  };
}
