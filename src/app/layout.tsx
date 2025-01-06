import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
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
          {children}
          <Toaster position="bottom-right" richColors />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
