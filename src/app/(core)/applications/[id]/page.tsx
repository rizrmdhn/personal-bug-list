/* eslint-disable @next/next/no-img-element */
"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export default function DetailApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [details] = api.applications.details.useSuspenseQuery({ id });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="container flex flex-col space-y-8 py-6">
        {/* Application Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">
                {details.name}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {details.key}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {details.isActive && <Badge>Active</Badge>}
              {details.isRevoked && (
                <Badge variant="destructive">Revoked</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              Created {format(new Date(details.createdAt), "PPP")}
            </div>
          </CardContent>
        </Card>

        {/* Bugs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Reported Bugs</h2>
            <Button variant="outline">Filter</Button>
          </div>

          {details.bugs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  No bugs reported yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {details.bugs.map((bug) => (
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
                          <Badge variant="outline">{bug.tags}</Badge>
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
                          <div>
                            Updated: {format(new Date(bug.updatedAt), "PPP")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
