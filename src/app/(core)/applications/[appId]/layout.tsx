import { api, HydrateClient } from "@/trpc/server";
import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ appId: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const appId = (await params).appId;

  api.applications.details.prefetch({ id: appId });

  return <HydrateClient>{children}</HydrateClient>;
}
