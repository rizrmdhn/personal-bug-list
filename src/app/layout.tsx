import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import generateMetadata from "@/lib/generate-metadata";

export const metadata = generateMetadata({
  title: "Bug Tracker",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster position="bottom-right" richColors />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
