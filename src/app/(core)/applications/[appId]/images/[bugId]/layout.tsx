import { api, HydrateClient } from "@/trpc/server";
import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ bugId: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const bugId = (await params).bugId;

  api.bugImages.get.prefetch({ bugId });

  return <HydrateClient>{children}</HydrateClient>;
}
