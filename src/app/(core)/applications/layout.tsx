import generateMetadata from "@/lib/generate-metadata";
import type React from "react";

export const metadata = generateMetadata({
  title: "Applications",
  description: "List all of the applications connected to your bug tracker",
});

interface ApplicationsLayoutProps {
  children: React.ReactNode;
  sheet: React.ReactNode;
}

export default function layout({ children, sheet }: ApplicationsLayoutProps) {
  return (
    <>
      {children}
      {sheet}
    </>
  );
}
