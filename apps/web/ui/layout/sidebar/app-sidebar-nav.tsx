"use client";

import useWorkspace from "@/lib/swr/use-workspace";
import {
  Cards,
  ChartActivity2,
  ChartLine,
  ConnectedDots,
  Crosshairs3,
  CubeSettings,
  Discount,
  Gauge6,
  Gear2,
  Globe,
  GlobePointer,
  InvoiceDollar,
  LinesY,
  MarketingTarget,
  Megaphone,
  Nodes4,
  QRCode,
  Receipt2,
  Rocket,
  SatelliteDish,
  ShieldCheck,
  ShieldKeyhole,
  ShieldUser,
  Sliders,
  SquareCheck,
  UserFocus,
  Users,
  UsersSettings,
  WindowSettings,
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

const iconOr = <T,>(icon: T | undefined, fallback: T) => icon ?? fallback;

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
            icon: iconOr(ShieldUser, Users),
            href: `/${slug}/vpn/subscribers`,
          },
        ],
      },
      {
        name: "Business",
        items: [
          {
            name: "Plans",
            icon: iconOr(Cards, Receipt2),
            href: `/${slug}/vpn/plans`,
          },
          {
            name: "Orders",
            icon: iconOr(InvoiceDollar, Receipt2),
            href: `/${slug}/vpn/orders`,
          },
          {
            name: "Traffic",
            icon: iconOr(ChartActivity2, LinesY),
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
            icon: iconOr(SatelliteDish, Gauge6),
            href: `/${slug}/operations`,
            exact: true,
          },
          {
            name: "Users",
            icon: iconOr(UserFocus, Users),
            href: `/${slug}/operations/users`,
          },
          {
            name: "Nodes",
            icon: iconOr(Nodes4, Globe),
            href: `/${slug}/operations/nodes`,
          },
          {
            name: "Hosts",
            icon: iconOr(GlobePointer, ConnectedDots),
            href: `/${slug}/operations/hosts`,
          },
        ],
      },
      {
        name: "Configuration",
        items: [
          {
            name: "Profiles & squads",
            icon: iconOr(Sliders, ShieldCheck),
            href: `/${slug}/operations/configurations`,
          },
          {
            name: "Subscriptions",
            icon: iconOr(QRCode, Receipt2),
            href: `/${slug}/operations/subscriptions`,
          },
          {
            name: "System",
            icon: iconOr(WindowSettings, CubeSettings),
            href: `/${slug}/operations/system`,
          },
          {
            name: "Insights & billing",
            icon: iconOr(ChartActivity2, LinesY),
            href: `/${slug}/operations/insights`,
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
            icon: iconOr(Rocket, Gauge6),
            href: `/${slug}/growth`,
            exact: true,
          },
          {
            name: "Campaigns",
            icon: iconOr(Megaphone, MarketingTarget),
            href: `/${slug}/growth/campaigns`,
          },
          {
            name: "Leads",
            icon: iconOr(Crosshairs3, Users),
            href: `/${slug}/growth/leads`,
          },
          {
            name: "Tasks",
            icon: iconOr(SquareCheck, LinesY),
            href: `/${slug}/growth/tasks`,
          },
          {
            name: "Team",
            icon: iconOr(UsersSettings, Users),
            href: `/${slug}/growth/team`,
          },
          {
            name: "Promo codes",
            icon: iconOr(Discount, Receipt2),
            href: `/${slug}/growth/promotions`,
          },
        ],
      },
      {
        name: "Insights",
        items: [
          {
            name: "Analytics",
            icon: iconOr(ChartLine, LinesY),
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
            icon: iconOr(ShieldKeyhole, ShieldCheck),
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
