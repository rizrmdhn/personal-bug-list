import { api } from "@/trpc/server";
import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const id = (await params).id;
  api.applications.details.prefetch({ id });

  return children;
}
