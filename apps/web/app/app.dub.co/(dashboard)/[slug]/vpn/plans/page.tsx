import { VPN_PLANS } from "@/lib/remnawave/plans";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel } from "@/ui/vpn/vpn-ui";
import { Badge, Button } from "@dub/ui";
import { provisionPlan } from "./actions";

export default async function PlansPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PageContent
      title="VPN plans"
      titleInfo={{ title: "Provision VPN access with predefined limits." }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {VPN_PLANS.map((plan) => (
            <VpnPanel
              key={plan.id}
              className={`relative flex flex-col p-5 transition-[filter] hover:drop-shadow-card-hover ${plan.featured ? "border-border-emphasis" : ""}`}
            >
              {plan.featured && (
                <Badge variant="black" className="absolute right-4 top-4">
                  Most popular
                </Badge>
              )}
              <p className="text-content-emphasis font-semibold">{plan.name}</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-content-emphasis text-3xl font-semibold tracking-tight">
                  ${plan.price}
                </span>
                <span className="text-content-subtle pb-1 text-sm">
                  /{plan.durationDays === 365 ? "year" : "month"}
                </span>
              </div>
              <p className="text-content-subtle mt-3 min-h-10 text-sm leading-5">
                {plan.description}
              </p>
              <dl className="border-border-subtle mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-content-subtle">Traffic</dt>
                  <dd className="text-content-emphasis font-medium">
                    {plan.trafficGb >= 1000
                      ? `${plan.trafficGb / 1000} TB`
                      : `${plan.trafficGb} GB`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-subtle">Devices</dt>
                  <dd className="text-content-emphasis font-medium">
                    {plan.devices}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-subtle">Reset</dt>
                  <dd className="text-content-emphasis font-medium capitalize">
                    {plan.reset.toLowerCase()}
                  </dd>
                </div>
              </dl>
              <form action={provisionPlan} className="mt-5 space-y-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="planId" value={plan.id} />
                <input
                  name="username"
                  required
                  minLength={3}
                  placeholder="Subscriber name"
                  className="border-border-subtle bg-bg-default placeholder:text-content-subtle focus:border-border-emphasis h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-4 focus:ring-neutral-100"
                />
                <Button text={`Provision ${plan.name}`} />
              </form>
            </VpnPanel>
          ))}
        </div>
        <p className="text-content-subtle mt-4 text-xs">
          Provisioning creates the subscriber directly in Remnawave with the
          selected expiry, traffic allowance, reset strategy, and device limit.
          Prices are the current Detz catalog and are not charged automatically
          yet.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
