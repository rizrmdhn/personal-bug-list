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
import { Clock, Link as LinkIcon } from "lucide-react";
import BugsSection from "./bug-section";

export default function DetailApplicationPage() {
  const params = useParams<{ appId: string }>();
  const [details] = api.applications.details.useSuspenseQuery({
    id: params.appId,
  });

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
              {details.isActive ? (
                <Badge className="bg-green-500 text-white hover:bg-green-500">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
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
        <BugsSection />
      </div>
    </div>
  );
}
