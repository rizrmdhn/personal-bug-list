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
