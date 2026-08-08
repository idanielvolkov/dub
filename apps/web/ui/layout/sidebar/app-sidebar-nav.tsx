"use client";

import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  CubeSettings,
  Gauge6,
  Gear2,
  Globe,
  LinesY,
  Receipt2,
  ShieldCheck,
  Users,
} from "@dub/ui/icons";
import { SidebarNav, SidebarNavAreas, SidebarNavGroups } from "./sidebar-nav";
import { WorkspaceDropdown } from "./workspace-dropdown";

type SidebarNavData = {
  slug: string;
  pathname: string;
};

const NAV_GROUPS: SidebarNavGroups<SidebarNavData> = ({ slug, pathname }) => [
  {
    id: "vpn",
    name: "VPN Business",
    description:
      "Manage subscribers, VPN servers, traffic, plans, and service health.",
    icon: ShieldCheck,
    href: slug ? `/${slug}/vpn` : "/vpn",
    active: pathname.startsWith(`/${slug}/vpn`),
  },
];

const NAV_AREAS: SidebarNavAreas<SidebarNavData> = {
  vpn: ({ slug }) => ({
    title: "VPN Business",
    direction: "left",
    content: [
      {
        items: [
          {
            name: "Overview",
            icon: Gauge6,
            href: `/${slug}/vpn`,
            exact: true,
          },
          {
            name: "Subscribers",
            icon: Users,
            href: `/${slug}/vpn/subscribers`,
          },
          {
            name: "VPN Servers",
            icon: Globe,
            href: `/${slug}/vpn/servers`,
          },
        ],
      },
      {
        name: "Business",
        items: [
          {
            name: "Plans",
            icon: Receipt2,
            href: `/${slug}/vpn/plans`,
          },
          {
            name: "Traffic",
            icon: LinesY,
            href: `/${slug}/vpn/traffic`,
          },
        ],
      },
      {
        name: "Operations",
        items: [
          {
            name: "System",
            icon: CubeSettings,
            href: `/${slug}/vpn/system`,
          },
        ],
      },
    ],
  }),
  userSettings: () => ({
    title: "Account",
    hideSwitcherIcons: true,
    content: [
      {
        items: [
          {
            name: "General",
            icon: Gear2,
            href: "/account/settings",
            exact: true,
          },
          {
            name: "Security",
            icon: ShieldCheck,
            href: "/account/settings/security",
          },
        ],
      },
    ],
  }),
};

export function AppSidebarNav({
  toolContent,
}: {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
}) {
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();

  return (
    <SidebarNav
      groups={NAV_GROUPS}
      areas={NAV_AREAS}
      currentArea={
        pathname.startsWith("/account/settings") ? "userSettings" : "vpn"
      }
      data={{
        slug: slug || "",
        pathname,
      }}
      toolContent={toolContent}
      switcher={<WorkspaceDropdown />}
    />
  );
}
