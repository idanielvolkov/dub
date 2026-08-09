import { getSession } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { supportTicketsFromStore } from "@/lib/vpn/support";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, CardList, CardListCard, EmptyState, Input } from "@dub/ui";
import { LifeRing } from "@dub/ui/icons";
import { createSupportTicket, updateSupportTicket } from "./actions";

const statusLabel = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
} as const;

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
      users: { where: { userId: session?.user.id }, select: { role: true } },
    },
  });
  const tickets = supportTicketsFromStore(workspace.store);
  const canManage = ["owner", "member"].includes(
    workspace.users[0]?.role || "viewer",
  );
  const open = tickets.filter((ticket) => ticket.status === "open");
  const active = tickets.filter((ticket) => ticket.status === "in_progress");
  const resolved = tickets.filter((ticket) => ticket.status === "resolved");

  return (
    <PageContent
      title="Support"
      titleInfo={{ title: "Resolve customer questions and service issues." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
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

        {canManage && (
          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Create ticket
              </h2>
              <p className="text-content-subtle text-sm">
                Add a customer request to the shared queue
              </p>
            </div>
            <CardList>
              <CardListCard innerClassName="p-5" hoverStateEnabled={false}>
                <form
                  action={createSupportTicket}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <Input
                    name="subject"
                    placeholder="What does the customer need help with?"
                    required
                    className="h-9 sm:col-span-2"
                  />
                  <Input
                    name="customerName"
                    placeholder="Customer name"
                    className="h-9"
                  />
                  <Input
                    name="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    required
                    className="h-9"
                  />
                  <FormCombobox
                    name="priority"
                    defaultValue="normal"
                    className="h-9"
                    options={[
                      { value: "low", label: "Low priority" },
                      { value: "normal", label: "Normal priority" },
                      { value: "high", label: "High priority" },
                      { value: "urgent", label: "Urgent" },
                    ]}
                  />
                  <Input
                    name="note"
                    placeholder="Internal note"
                    className="h-9"
                  />
                  <div className="flex justify-end sm:col-span-2">
                    <OperationSubmit>Create ticket</OperationSubmit>
                  </div>
                </form>
              </CardListCard>
            </CardList>
          </section>
        )}

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              All tickets
            </h2>
            <p className="text-content-subtle text-sm">
              {tickets.length} requests across the workspace
            </p>
          </div>
          {tickets.length ? (
            <CardList variant="compact">
              {tickets.map((ticket) => (
                <CardListCard
                  key={ticket.id}
                  innerClassName="px-5 py-4"
                  hoverStateEnabled={false}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-48 flex-1">
                      <p className="text-content-emphasis truncate text-sm font-medium">
                        {ticket.subject}
                      </p>
                      <p className="text-content-subtle mt-0.5 truncate text-xs">
                        {ticket.customerName || ticket.customerEmail} ·{" "}
                        {ticket.customerEmail}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.priority === "urgent"
                          ? "red"
                          : ticket.priority === "high"
                            ? "orange"
                            : "gray"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                    {canManage ? (
                      <form
                        action={updateSupportTicket}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="id" value={ticket.id} />
                        <FormCombobox
                          name="status"
                          defaultValue={ticket.status}
                          className="h-9 min-w-32"
                          options={Object.entries(statusLabel).map(
                            ([value, label]) => ({ value, label }),
                          )}
                        />
                        <OperationSubmit>Save</OperationSubmit>
                      </form>
                    ) : (
                      <Badge variant="gray">{statusLabel[ticket.status]}</Badge>
                    )}
                  </div>
                  {ticket.note && (
                    <p className="text-content-subtle mt-3 border-t border-neutral-200 pt-3 text-sm">
                      {ticket.note}
                    </p>
                  )}
                </CardListCard>
              ))}
            </CardList>
          ) : (
            <div className="py-16">
              <EmptyState
                icon={LifeRing}
                title="No support tickets"
                description="Create a ticket when a customer needs help."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
