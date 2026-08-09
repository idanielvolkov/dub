import { MainNav } from "@/ui/layout/main-nav";
import { AppSidebarNav } from "@/ui/layout/sidebar/app-sidebar-nav";
import { constructMetadata } from "@dub/utils";
import type { Viewport } from "next";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const metadata = constructMetadata();
export const viewport: Viewport = {
  themeColor: "#e1e1e1",
};

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white">
      <MainNav sidebar={AppSidebarNav}>{children}</MainNav>
    </div>
  );
}
