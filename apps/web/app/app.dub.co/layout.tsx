"use client";

import { ModalProvider } from "@/ui/modals/modal-provider";
import { Analytics as DubAnalytics } from "@dub/analytics/react";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DubAnalytics
        apiHost="/_proxy/dub"
        cookieOptions={{
          domain: process.env.VERCEL === "1" ? ".detz.fun" : "localhost",
        }}
        domainsConfig={{
          refer: "detz.fun",
        }}
      />
      <ModalProvider>{children}</ModalProvider>
    </SessionProvider>
  );
}
