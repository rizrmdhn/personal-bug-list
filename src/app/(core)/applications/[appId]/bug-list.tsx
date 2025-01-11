/* eslint-disable @next/next/no-img-element */
import PaginationControls from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { type BugModelWithPresignedUrls } from "@/types/bugs.types";
import { type PaginationResult } from "@/server/db/utils";
import { format } from "date-fns";
import { Clock, ImageIcon, Loader2 } from "lucide-react";

// components/BugsList.tsx
interface BugsListProps {
  data: PaginationResult<BugModelWithPresignedUrls> | undefined;
  isPending: boolean;
  isError: boolean;
  errorMessages: string;
  onPageChange: (page: number) => void;
}

export const BugsList: React.FC<BugsListProps> = ({
  data,
  isPending,
  isError,
  errorMessages,
  onPageChange,
}) => {
  if (isPending) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="text-muted-foreground">Error fetching data</div>
          <div className="text-muted-foreground">{errorMessages}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.data.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            No bugs reported yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {data.data.map((bug) => (
          <Card key={bug.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{bug.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {bug.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={cn(
                        bug.severity === "CRITICAL"
                          ? "destructive"
                          : bug.severity === "HIGH"
                            ? "warning"
                            : bug.severity === "MEDIUM"
                              ? "default"
                              : "secondary",
                      )}
                    >
                      {bug.severity}
                    </Badge>
                    {bug.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="secondary">{bug.status}</Badge>
                  </div>
                </div>
                {bug.images.length > 0 && (
                  <div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      {bug.images.map((image) => (
                        <div
                          key={image.id}
                          className="relative aspect-video overflow-hidden rounded-lg border"
                        >
                          <img
                            src={image.url}
                            alt={image.file}
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(new Date(bug.createdAt), "PPP")}
                  </div>
                  {bug.updatedAt && (
                    <div>Updated: {format(new Date(bug.updatedAt), "PPP")}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && (
        <PaginationControls
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          pages={data.pages}
          hasNextPage={data.hasNextPage}
          hasPrevPage={data.hasPrevPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
