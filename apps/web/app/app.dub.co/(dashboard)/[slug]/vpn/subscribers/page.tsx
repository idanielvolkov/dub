import { getRemnawaveUsers } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Button, StatusBadge } from "@dub/ui";
import { createSubscriber } from "./actions";

export default async function SubscribersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { users, total } = await getRemnawaveUsers();

  return (
    <PageContent
      title="Subscribers"
      titleInfo={{ title: "Create and manage VPN access in Remnawave." }}
    >
      <PageWidthWrapper className="pb-10">
        <form
          action={createSubscriber}
          className="border-border-subtle bg-bg-default mb-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_150px_auto]"
        >
          <input type="hidden" name="slug" value={slug} />
          <input
            name="username"
            required
            minLength={3}
            placeholder="Subscriber name"
            className="border-border-subtle bg-bg-default placeholder:text-content-subtle focus:border-border-emphasis h-10 rounded-lg border px-3 text-sm outline-none transition focus:ring-4 focus:ring-neutral-100"
          />
          <select
            name="durationDays"
            defaultValue="30"
            className="border-border-subtle bg-bg-default focus:border-border-emphasis h-10 rounded-lg border px-3 text-sm outline-none"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
          <Button text="Add subscriber" className="px-4" />
        </form>
        <VpnPanel>
          <VpnPanelHeader
            title="VPN subscribers"
            description={`${total} subscriber${total === 1 ? "" : "s"} in Remnawave`}
            controls={<StatusBadge variant="success">Live data</StatusBadge>}
          />
          {users.length ? (
            <div>
              <div className="border-border-subtle text-content-emphasis hidden grid-cols-[1fr_140px_160px] border-b bg-neutral-50/60 px-5 py-3 text-xs font-medium sm:grid">
                <span>Subscriber</span>
                <span>Status</span>
                <span className="text-right">Expires</span>
              </div>
              <div className="divide-border-subtle divide-y">
                {users.map((user) => (
                  <div
                    key={user.uuid}
                    className="hover:bg-bg-muted grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors sm:grid-cols-[1fr_140px_160px]"
                  >
                    <div>
                      <p className="text-content-emphasis text-sm font-medium">
                        {user.username}
                      </p>
                      <p className="text-content-subtle mt-0.5 truncate font-mono text-xs">
                        {user.uuid}
                      </p>
                    </div>
                    <StatusBadge
                      className="hidden sm:flex"
                      variant={
                        user.status.toLowerCase() === "active"
                          ? "success"
                          : "neutral"
                      }
                    >
                      {user.status.toLowerCase()}
                    </StatusBadge>
                    <span className="text-content-subtle text-right text-xs">
                      {new Date(user.expireAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-xl">
                ◉
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-950">
                No subscribers yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                New VPN subscribers created in Detz will appear here instantly.
              </p>
            </div>
          )}
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
