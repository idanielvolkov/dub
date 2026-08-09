import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  CreatePlanButton,
  PlanCardActions,
  RestorePlanButton,
} from "@/ui/vpn/plan-actions";
import { VpnPanel } from "@/ui/vpn/vpn-ui";
import { Badge, CardList } from "@dub/ui";

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
              {isOwner && <PlanCardActions slug={slug} plan={plan} />}
            </VpnPanel>
          ))}
        </div>

        {isOwner && (
          <div className="flex justify-end">
            <CreatePlanButton slug={slug} />
          </div>
        )}

        {isOwner && archivedPlans.length > 0 && (
          <VpnPanel className="p-5">
            <h2 className="text-content-emphasis font-semibold">
              Archived plans
            </h2>
            <CardList variant="compact" className="mt-4">
              {archivedPlans.map((plan) => (
                <CardList.Card key={plan.id} hoverStateEnabled={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-content-emphasis text-sm font-medium">
                        {plan.name}
                      </p>
                      <p className="text-content-subtle text-xs">
                        ${plan.price}
                      </p>
                    </div>
                    <RestorePlanButton slug={slug} planId={plan.id} />
                  </div>
                </CardList.Card>
              ))}
            </CardList>
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
