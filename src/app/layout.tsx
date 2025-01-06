import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import generateMetadata from "@/lib/generate-metadata";
import { ThemeProvider } from "@/providers/theme-provider";

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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
