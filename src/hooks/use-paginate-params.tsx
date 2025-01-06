import { useQueryState, parseAsInteger, type Options } from "nuqs";

interface PaginateParams {
  page: number;
  setPage: (
    value: number | ((old: number) => number | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  limit: number;
  setLimit: (
    value: number | ((old: number) => number | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
}

interface PaginateParamsOptions {
  pageNumber: number;
  limitPage: number;
}

export default function usePaginateParams({
  pageNumber = 1,
  limitPage = 10,
}: PaginateParamsOptions): PaginateParams {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(pageNumber),
  );
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(limitPage),
  );

  return {
    page,
    setPage,
    limit,
    setLimit,
  };
}
