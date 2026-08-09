import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { vpnPlansFromStore } from "@/lib/remnawave/plans";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  CreatePlanButton,
  PlanCardActions,
  RestorePlanButton,
} from "@/ui/vpn/plan-actions";
import { Badge, CardList, CardListCard, EmptyState } from "@dub/ui";
import { Cards } from "@dub/ui/icons";

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
      title="Plans"
      titleInfo={{ title: "Manage pricing and access limits." }}
    >
      <PageWidthWrapper className="space-y-6 pb-10">
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          {activePlans.map((plan) => (
            <CardList key={plan.id} className="h-full">
              <CardListCard
                hoverStateEnabled={false}
                outerClassName={
                  plan.featured ? "h-full border-neutral-900" : "h-full"
                }
                innerClassName="relative flex h-full flex-col p-5"
              >
                {plan.featured && (
                  <Badge variant="black" className="absolute right-4 top-4">
                    Most popular
                  </Badge>
                )}
                <p className="text-content-emphasis font-semibold">
                  {plan.name}
                </p>
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
                  <div className="mt-auto pt-5">
                    <PlanCardActions slug={slug} plan={plan} />
                  </div>
                )}
              </CardListCard>
            </CardList>
          ))}
        </div>

        {!activePlans.length && (
          <EmptyState
            icon={Cards}
            title="No active plans"
            description="Create a plan to start selling VPN access."
          />
        )}

        {isOwner && (
          <div className="flex justify-end">
            <CreatePlanButton slug={slug} />
          </div>
        )}

        {isOwner && archivedPlans.length > 0 && (
          <CardList>
            <CardListCard innerClassName="p-5" hoverStateEnabled={false}>
              <h2 className="text-content-emphasis font-semibold">
                Archived plans
              </h2>
              <CardList variant="compact" className="mt-4">
                {archivedPlans.map((plan) => (
                  <CardListCard key={plan.id} hoverStateEnabled={false}>
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
                  </CardListCard>
                ))}
              </CardList>
            </CardListCard>
          </CardList>
        )}

        <p className="text-content-subtle text-xs">
          Provisioning creates a user in Remnawave. Prices are informational
          until checkout is connected.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
