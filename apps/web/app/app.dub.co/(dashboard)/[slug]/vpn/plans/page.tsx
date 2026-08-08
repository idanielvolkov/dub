import { VPN_PLANS } from "@/lib/remnawave/plans";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { provisionPlan } from "./actions";

export default async function PlansPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PageContent title="VPN plans">
      <PageWidthWrapper className="py-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {VPN_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border bg-white p-5 shadow-sm ${plan.featured ? "border-neutral-950 ring-1 ring-neutral-950" : "border-neutral-200"}`}
            >
              {plan.featured && (
                <span className="absolute right-4 top-4 rounded-full bg-neutral-950 px-2.5 py-1 text-[11px] font-medium text-white">
                  Popular
                </span>
              )}
              <p className="font-semibold text-neutral-950">{plan.name}</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-semibold tracking-tight">
                  ${plan.price}
                </span>
                <span className="pb-1 text-sm text-neutral-500">
                  /{plan.durationDays === 365 ? "year" : "month"}
                </span>
              </div>
              <p className="mt-3 min-h-10 text-sm leading-5 text-neutral-500">
                {plan.description}
              </p>
              <dl className="mt-5 space-y-2 border-t border-neutral-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Traffic</dt>
                  <dd className="font-medium">
                    {plan.trafficGb >= 1000
                      ? `${plan.trafficGb / 1000} TB`
                      : `${plan.trafficGb} GB`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Devices</dt>
                  <dd className="font-medium">{plan.devices}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Reset</dt>
                  <dd className="font-medium capitalize">
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
                  className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
                />
                <button className="h-10 w-full rounded-lg bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800">
                  Provision {plan.name}
                </button>
              </form>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Provisioning creates the subscriber directly in Remnawave with the
          selected expiry, traffic allowance, reset strategy, and device limit.
          Prices are the current Detz catalog and are not charged automatically
          yet.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
