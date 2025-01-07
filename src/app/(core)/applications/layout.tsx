import generateMetadata from "@/lib/generate-metadata";
import type React from "react";

export const metadata = generateMetadata({
  title: "Applications",
  description: "List all of the applications connected to your bug tracker",
});

export default function layout({ children }: { children: React.ReactNode }) {
  return children;
}
