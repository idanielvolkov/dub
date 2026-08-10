import { getSession } from "@/lib/auth/utils";
import { canAccessPlatformArea } from "@/lib/platform-access";
import { prisma } from "@/lib/prisma";
import { supportTicketsFromStore } from "@/lib/vpn/support";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  CreateSupportTicketButton,
  SupportTicketsTable,
} from "@/ui/vpn/support-tickets-table";
import { MetricCards } from "@dub/ui";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, session] = await Promise.all([params, getSession()]);
  const workspace = await prisma.project.findFirstOrThrow({
    where: { slug, users: { some: { userId: session?.user.id } } },
    select: {
      store: true,
      users: {
        where: { userId: session?.user.id },
        select: { role: true, workspacePreferences: true },
      },
    },
  });
  const tickets = supportTicketsFromStore(workspace.store);
  const membership = workspace.users[0];
  const canManage = membership
    ? canAccessPlatformArea({
        role: membership.role,
        workspacePreferences: membership.workspacePreferences,
        area: "support",
        minimum: "manage",
      })
    : false;
  const open = tickets.filter((ticket) => ticket.status === "open");
  const active = tickets.filter((ticket) => ticket.status === "in_progress");
  const resolved = tickets.filter((ticket) => ticket.status === "resolved");

  return (
    <PageContent
      title="Support"
      titleInfo={{ title: "Resolve customer questions and service issues." }}
      controls={
        canManage ? <CreateSupportTicketButton slug={slug} /> : undefined
      }
    >
      <PageWidthWrapper className="pb-10">
        <MetricCards
          items={[
            { label: "Open", value: open.length, detail: "Awaiting triage" },
            {
              label: "In progress",
              value: active.length,
              detail: "Assigned to the team",
            },
            {
              label: "Urgent",
              value: tickets.filter(
                (ticket) =>
                  ticket.priority === "urgent" && ticket.status !== "resolved",
              ).length,
              detail: "Needs immediate attention",
            },
            {
              label: "Resolved",
              value: resolved.length,
              detail: "Closed requests",
            },
          ]}
        />

        <section className="mt-6">
          <SupportTicketsTable
            slug={slug}
            tickets={tickets}
            canManage={canManage}
          />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
