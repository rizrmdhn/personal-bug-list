import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import React from "react";
import { BugsList } from "./bug-list";
import { useParams } from "next/navigation";

// components/BugsSection.tsx
interface BugsSectionProps {}

const BugsSection: React.FC<BugsSectionProps> = () => {
  const params = useParams<{ appId: string }>();

  const [page, setPage] = React.useState<number>(1);

  const { data, isPending, isError, error } = api.bugs.paginate.useQuery({
    applicationId: params.appId,
    page,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reported Bugs</h2>
        <Button variant="outline">Filter</Button>
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
