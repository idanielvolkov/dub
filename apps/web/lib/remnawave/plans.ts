import { prisma } from "@/lib/prisma";

export type VpnPlanReset = "NO_RESET" | "DAY" | "WEEK" | "MONTH";

export type VpnPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  trafficGb: number;
  devices: number;
  reset: VpnPlanReset;
  featured: boolean;
  archived: boolean;
  createdAt?: string;
};

export const DEFAULT_VPN_PLANS: VpnPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "A simple monthly plan for light personal use.",
    price: 5,
    durationDays: 30,
    trafficGb: 100,
    devices: 2,
    reset: "MONTH",
    featured: false,
    archived: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "More traffic and devices for everyday VPN access.",
    price: 10,
    durationDays: 30,
    trafficGb: 500,
    devices: 5,
    reset: "MONTH",
    featured: true,
    archived: false,
  },
  {
    id: "business",
    name: "Business",
    description: "Annual access with a generous shared allowance.",
    price: 90,
    durationDays: 365,
    trafficGb: 2000,
    devices: 10,
    reset: "MONTH",
    featured: false,
    archived: false,
  },
];

export function vpnPlansFromStore(store: unknown): VpnPlan[] {
  if (!store || typeof store !== "object" || Array.isArray(store)) {
    return DEFAULT_VPN_PLANS;
  }
  const plans = (store as { vpnPlans?: unknown }).vpnPlans;
  return Array.isArray(plans) ? (plans as VpnPlan[]) : DEFAULT_VPN_PLANS;
}

export async function getWorkspaceVpnPlans(slug: string) {
  const workspace = await prisma.project.findUnique({
    where: { slug },
    select: { store: true },
  });
  return vpnPlansFromStore(workspace?.store);
}
