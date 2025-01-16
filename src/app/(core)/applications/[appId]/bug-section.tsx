import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import React from "react";
import { BugsList } from "./bug-list";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVALIABLE_BUG_STATUS } from "@/lib/constants";
import { type PaginateBugsSchemaType } from "@/schema/bugs.schema";

interface BugsSectionProps {}

const BugsSection: React.FC<BugsSectionProps> = () => {
  const params = useParams<{ appId: string }>();

  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [status, setStatus] = React.useState<string | undefined>(undefined);

  const queryParams: PaginateBugsSchemaType = React.useMemo(
    () => ({
      applicationId: params.appId,
      page,
      pageSize,
      simpleSearch: true,
      query: status ? status : undefined,
    }),
    [params.appId, page, status, pageSize],
  );

  const { data, isPending, isError, error } =
    api.bugs.paginate.useQuery(queryParams);

  const handleStatusChange = React.useCallback((value: string | undefined) => {
    setStatus(value);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reported Bugs</h2>
        <div className="flex gap-4">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent className="w-32">
              <SelectGroup>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => handleStatusChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {AVALIABLE_BUG_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              handleStatusChange(undefined);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <BugsList
        data={data}
        isPending={isPending}
        isError={isError}
        errorMessages={error?.message ?? ""}
        onPageChange={setPage}
      />
    </div>
  );
};

export default BugsSection;
