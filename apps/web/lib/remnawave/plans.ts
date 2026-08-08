export const VPN_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "A simple monthly plan for light personal use.",
    price: 5,
    durationDays: 30,
    trafficGb: 100,
    devices: 2,
    reset: "MONTH" as const,
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "More traffic and devices for everyday VPN access.",
    price: 10,
    durationDays: 30,
    trafficGb: 500,
    devices: 5,
    reset: "MONTH" as const,
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    description: "Annual access with a generous shared allowance.",
    price: 90,
    durationDays: 365,
    trafficGb: 2000,
    devices: 10,
    reset: "MONTH" as const,
    featured: false,
  },
] as const;

export type VpnPlan = (typeof VPN_PLANS)[number];

export function getVpnPlan(id: string) {
  return VPN_PLANS.find((plan) => plan.id === id);
}
