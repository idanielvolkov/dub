"use client";

import useWorkspace from "@/lib/swr/use-workspace";
import {
  ConnectedDots,
  CubeSettings,
  Gauge6,
  Gear2,
  Globe,
  LinesY,
  MarketingTarget,
  Receipt2,
  ShieldCheck,
  Users,
} from "@dub/ui/icons";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";
import { SidebarNav, SidebarNavAreas, SidebarNavGroups } from "./sidebar-nav";
import { WorkspaceDropdown } from "./workspace-dropdown";

type SidebarNavData = {
  slug: string;
  pathname: string;
  isOwner: boolean;
};

const NAV_GROUPS: SidebarNavGroups<SidebarNavData> = ({
  slug,
  pathname,
  isOwner,
}) => [
  {
    id: "vpn",
    name: "VPN Business",
    description:
      "Manage subscribers, VPN servers, traffic, plans, and service health.",
    icon: ShieldCheck,
    href: slug ? `/${slug}/vpn` : "/vpn",
    active: pathname.startsWith(`/${slug}/vpn`),
  },
  ...(isOwner
    ? [
        {
          id: "operations",
          name: "Remnawave Operations",
          description:
            "Technical control of users, nodes, hosts, profiles, and subscriptions.",
          icon: CubeSettings,
          href: slug ? `/${slug}/operations` : "/operations",
          active: pathname.startsWith(`/${slug}/operations`),
        },
      ]
    : []),
  {
    id: "growth",
    name: "Growth Workspace",
    description:
      "Campaigns, acquisition, leads, promotions, and marketing analytics.",
    icon: MarketingTarget,
    href: slug ? `/${slug}/growth` : "/growth",
    active: pathname.startsWith(`/${slug}/growth`),
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
    ],
  }),
  operations: ({ slug }) => ({
    title: "Remnawave Operations",
    direction: "left",
    content: [
      {
        items: [
          {
            name: "Overview",
            icon: Gauge6,
            href: `/${slug}/operations`,
            exact: true,
          },
          { name: "Users", icon: Users, href: `/${slug}/operations/users` },
          { name: "Nodes", icon: Globe, href: `/${slug}/operations/nodes` },
          {
            name: "Hosts",
            icon: ConnectedDots,
            href: `/${slug}/operations/hosts`,
          },
        ],
      },
      {
        name: "Configuration",
        items: [
          {
            name: "Profiles & squads",
            icon: ShieldCheck,
            href: `/${slug}/operations/configurations`,
          },
          {
            name: "Subscriptions",
            icon: Receipt2,
            href: `/${slug}/operations/subscriptions`,
          },
          {
            name: "System",
            icon: CubeSettings,
            href: `/${slug}/operations/system`,
          },
        ],
      },
    ],
  }),
  growth: ({ slug }) => ({
    title: "Growth Workspace",
    direction: "left",
    content: [
      {
        items: [
          {
            name: "Overview",
            icon: Gauge6,
            href: `/${slug}/growth`,
            exact: true,
          },
          {
            name: "Campaigns",
            icon: MarketingTarget,
            href: `/${slug}/growth/campaigns`,
          },
          { name: "Leads", icon: Users, href: `/${slug}/growth/leads` },
          {
            name: "Promo codes",
            icon: Receipt2,
            href: `/${slug}/growth/promotions`,
          },
        ],
      },
      {
        name: "Insights",
        items: [
          {
            name: "Analytics",
            icon: LinesY,
            href: `/${slug}/growth/analytics`,
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
  const { isOwner } = useWorkspace();

  return (
    <SidebarNav
      groups={NAV_GROUPS}
      areas={NAV_AREAS}
      currentArea={
        pathname.startsWith("/account/settings")
          ? "userSettings"
          : pathname.startsWith(`/${slug}/operations`)
            ? "operations"
            : pathname.startsWith(`/${slug}/growth`)
              ? "growth"
              : "vpn"
      }
      data={{
        slug: slug || "",
        pathname,
        isOwner: Boolean(isOwner),
      }}
      toolContent={toolContent}
      switcher={<WorkspaceDropdown />}
    />
  );
}
