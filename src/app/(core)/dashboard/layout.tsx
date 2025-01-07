import generateMetadata from "@/lib/generate-metadata";
import type React from "react";

export const metadata = generateMetadata({
  title: "Dashboard",
  description: "Dashboard description",
});

export default function layout({ children }: { children: React.ReactNode }) {
  return children;
}
