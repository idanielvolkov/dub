import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VpnPlan, vpnPlansFromStore } from "@/lib/remnawave/plans";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";
import {
  createVpnPlan,
  provisionPlan,
  setVpnPlanArchived,
  updateVpnPlan,
} from "./actions";

const inputClass =
  "border-border-subtle bg-bg-default placeholder:text-content-subtle focus:border-border-emphasis h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-4 focus:ring-neutral-100";

function PlanFields({ plan }: { plan?: VpnPlan }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input
        className={inputClass}
        name="name"
        defaultValue={plan?.name}
        placeholder="Plan name"
        required
      />
      <input
        className={inputClass}
        name="price"
        type="number"
        min="0"
        step="0.01"
        defaultValue={plan?.price}
        placeholder="Price, USD"
        required
      />
      <input
        className={inputClass}
        name="durationDays"
        type="number"
        min="1"
        defaultValue={plan?.durationDays ?? 30}
        placeholder="Duration, days"
        required
      />
      <input
        className={inputClass}
        name="trafficGb"
        type="number"
        min="1"
        step="0.01"
        defaultValue={plan?.trafficGb}
        placeholder="Traffic, GB"
        required
      />
      <input
        className={inputClass}
        name="devices"
        type="number"
        min="1"
        defaultValue={plan?.devices}
        placeholder="Device limit"
        required
      />
      <select
        className={inputClass}
        name="reset"
        defaultValue={plan?.reset ?? "MONTH"}
      >
        <option value="NO_RESET">No reset</option>
        <option value="DAY">Daily reset</option>
        <option value="WEEK">Weekly reset</option>
        <option value="MONTH">Monthly reset</option>
      </select>
      <textarea
        className={`${inputClass} h-20 py-2 sm:col-span-2`}
        name="description"
        defaultValue={plan?.description}
        placeholder="Customer-facing description"
      />
      <label className="text-content-default flex items-center gap-2 text-sm sm:col-span-2">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={plan?.featured}
        />
        Mark as most popular
      </label>
    </div>
  );
}

export default async function PlansPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const workspace = session?.user.id
    ? await prisma.project.findFirst({
        where: { slug, users: { some: { userId: session.user.id } } },
        select: {
          store: true,
          users: {
            where: { userId: session.user.id },
            select: { role: true },
            take: 1,
          },
        },
      })
    : null;
  const isOwner = workspace?.users[0]?.role === "owner";
  const plans = vpnPlansFromStore(workspace?.store);
  const activePlans = plans.filter((plan) => !plan.archived);
  const archivedPlans = plans.filter((plan) => plan.archived);

  return (
    <PageContent
      title="VPN plans"
      titleInfo={{ title: "Manage the catalog and provision VPN access." }}
    >
      <PageWidthWrapper className="space-y-6 pb-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {activePlans.map((plan) => (
            <VpnPanel
              key={plan.id}
              className={`hover:drop-shadow-card-hover relative flex flex-col p-5 transition-[filter] ${plan.featured ? "border-border-emphasis" : ""}`}
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
                  /{plan.durationDays} days
                </span>
              </div>
              <p className="text-content-subtle mt-3 min-h-10 text-sm leading-5">
                {plan.description}
              </p>
              <dl className="border-border-subtle mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-content-subtle">Traffic</dt>
                  <dd className="text-content-emphasis font-medium">
                    {plan.trafficGb} GB
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
                    {plan.reset.toLowerCase().replace("_", " ")}
                  </dd>
                </div>
              </dl>
              {isOwner && (
                <>
                  <form action={provisionPlan} className="mt-5 space-y-2">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="planId" value={plan.id} />
                    <input
                      name="username"
                      required
                      minLength={3}
                      placeholder="Subscriber name"
                      className={inputClass}
                    />
                    <OperationSubmit>Provision {plan.name}</OperationSubmit>
                  </form>
                  <details className="border-border-subtle mt-4 border-t pt-4">
                    <summary className="text-content-default cursor-pointer text-sm font-medium">
                      Edit plan
                    </summary>
                    <form action={updateVpnPlan} className="mt-4 space-y-4">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={plan.id} />
                      <PlanFields plan={plan} />
                      <OperationSubmit>Save changes</OperationSubmit>
                    </form>
                    <form action={setVpnPlanArchived} className="mt-2">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="id" value={plan.id} />
                      <input type="hidden" name="archived" value="true" />
                      <OperationSubmit
                        destructive
                        confirmMessage="Archive this plan? Existing subscribers will not be affected."
                      >
                        Archive plan
                      </OperationSubmit>
                    </form>
                  </details>
                </>
              )}
            </VpnPanel>
          ))}
        </div>

        {isOwner && (
          <VpnPanel className="p-5">
            <h2 className="text-content-emphasis font-semibold">Create plan</h2>
            <p className="text-content-subtle mt-1 text-sm">
              New limits become available for manual provisioning immediately.
            </p>
            <form action={createVpnPlan} className="mt-5 space-y-4">
              <input type="hidden" name="slug" value={slug} />
              <PlanFields />
              <OperationSubmit>Create plan</OperationSubmit>
            </form>
          </VpnPanel>
        )}

        {isOwner && archivedPlans.length > 0 && (
          <VpnPanel className="p-5">
            <h2 className="text-content-emphasis font-semibold">
              Archived plans
            </h2>
            <div className="mt-4 space-y-3">
              {archivedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border-border-subtle flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-content-emphasis text-sm font-medium">
                      {plan.name}
                    </p>
                    <p className="text-content-subtle text-xs">${plan.price}</p>
                  </div>
                  <form action={setVpnPlanArchived}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={plan.id} />
                    <input type="hidden" name="archived" value="false" />
                    <OperationSubmit>Restore</OperationSubmit>
                  </form>
                </div>
              ))}
            </div>
          </VpnPanel>
        )}

        <p className="text-content-subtle text-xs">
          Provisioning creates a subscriber directly in Remnawave. Catalog
          prices are informational until online checkout is connected.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
