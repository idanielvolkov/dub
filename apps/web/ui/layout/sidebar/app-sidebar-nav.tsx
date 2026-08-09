"use client";

import { canAccessPlatformArea } from "@/lib/platform-access";
import useWorkspace from "@/lib/swr/use-workspace";
import {
  BookOpen,
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
  LifeRing,
  LinesY,
  MarketingTarget,
  Megaphone,
  MoneyBills2,
  Nodes4,
  QRCode,
  Receipt2,
  ShieldCheck,
  ShieldKeyhole,
  Sliders,
  Users,
  UsersSettings,
} from "@dub/ui/icons";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";
import { SidebarNav, SidebarNavAreas, SidebarNavGroups } from "./sidebar-nav";
import { WorkspaceDropdown } from "./workspace-dropdown";

type SidebarNavData = {
  slug: string;
  pathname: string;
  workspaceAccess: boolean;
  supportAccess: boolean;
  financeAccess: boolean;
  remnawaveAccess: boolean;
  marketingAccess: boolean;
};

const iconOr = <T,>(icon: T | undefined, fallback: T) => icon ?? fallback;

const NAV_GROUPS: SidebarNavGroups<SidebarNavData> = ({
  slug,
  pathname,
  workspaceAccess,
  supportAccess,
  financeAccess,
  remnawaveAccess,
  marketingAccess,
}) => [
  ...(workspaceAccess
    ? [
        {
          id: "vpn",
          name: "Workspace",
          description: "Manage plans, orders, revenue, and customer sales.",
          icon: ShieldCheck,
          href: slug ? `/${slug}/vpn` : "/vpn",
          active: pathname.startsWith(`/${slug}/vpn`),
        },
      ]
    : []),
  ...(remnawaveAccess
    ? [
        {
          id: "operations",
          name: "Remnawave API",
          description:
            "Technical control of users, nodes, hosts, profiles, and subscriptions.",
          icon: CubeSettings,
          href: slug ? `/${slug}/operations` : "/operations",
          active: pathname.startsWith(`/${slug}/operations`),
        },
      ]
    : []),
  ...(marketingAccess
    ? [
        {
          id: "growth",
          name: "Marketing",
          description: "Manage campaigns, leads, promotions, and analytics.",
          icon: MarketingTarget,
          href: slug ? `/${slug}/growth` : "/growth",
          active: pathname.startsWith(`/${slug}/growth`),
        },
      ]
    : []),
];

const NAV_AREAS: SidebarNavAreas<SidebarNavData> = {
  vpn: ({ slug, supportAccess, financeAccess }) => ({
    title: "Workspace",
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
            name: "Plans",
            icon: iconOr(Cards, Receipt2),
            href: `/${slug}/vpn/plans`,
          },
          {
            name: "Orders",
            icon: iconOr(InvoiceDollar, Receipt2),
            href: `/${slug}/vpn/orders`,
          },
        ],
      },
      {
        name: "Operations",
        items: [
          ...(supportAccess
            ? [
                {
                  name: "Support",
                  icon: LifeRing,
                  href: `/${slug}/vpn/support` as `/${string}`,
                },
              ]
            : []),
          ...(financeAccess
            ? [
                {
                  name: "Finance",
                  icon: MoneyBills2,
                  href: `/${slug}/vpn/finance` as `/${string}`,
                },
              ]
            : []),
        ],
      },
      {
        name: "Organization",
        items: [
          {
            name: "Team",
            icon: iconOr(UsersSettings, Users),
            href: `/${slug}/vpn/team`,
          },
          {
            name: "Activity",
            icon: BookOpen,
            href: `/${slug}/vpn/activity`,
          },
        ],
      },
    ],
  }),
  operations: ({ slug }) => ({
    title: "Remnawave API",
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
          {
            name: "Users",
            icon: Users,
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
            name: "Configurations",
            icon: iconOr(Sliders, ShieldCheck),
            href: `/${slug}/operations/configurations`,
          },
          {
            name: "Subscriptions",
            icon: iconOr(QRCode, Receipt2),
            href: `/${slug}/operations/subscriptions`,
          },
        ],
      },
      {
        name: "Monitoring",
        items: [
          {
            name: "Traffic",
            icon: iconOr(ChartActivity2, LinesY),
            href: `/${slug}/operations/traffic`,
          },
          {
            name: "Devices",
            icon: iconOr(ShieldKeyhole, ShieldCheck),
            href: `/${slug}/operations/devices`,
          },
          {
            name: "Insights",
            icon: iconOr(ChartActivity2, LinesY),
            href: `/${slug}/operations/insights`,
          },
        ],
      },
    ],
  }),
  growth: ({ slug }) => ({
    title: "Marketing",
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
            icon: iconOr(Megaphone, MarketingTarget),
            href: `/${slug}/growth/campaigns`,
          },
          {
            name: "Leads",
            icon: iconOr(Crosshairs3, Users),
            href: `/${slug}/growth/leads`,
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
  const workspace = useWorkspace();
  const role = workspace.role || "member";
  const workspacePreferences = workspace.users?.[0]?.workspacePreferences;
  const workspaceAccess = canAccessPlatformArea({
    role,
    workspacePreferences,
    area: "workspace",
  });
  const remnawaveAccess = canAccessPlatformArea({
    role,
    workspacePreferences,
    area: "remnawave",
  });
  const supportAccess = canAccessPlatformArea({
    role,
    workspacePreferences,
    area: "support",
  });
  const financeAccess = canAccessPlatformArea({
    role,
    workspacePreferences,
    area: "finance",
  });
  const marketingAccess = canAccessPlatformArea({
    role,
    workspacePreferences,
    area: "marketing",
  });

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
        workspaceAccess,
        supportAccess,
        financeAccess,
        remnawaveAccess,
        marketingAccess,
      }}
      toolContent={toolContent}
      switcher={<WorkspaceDropdown />}
    />
  );
}
