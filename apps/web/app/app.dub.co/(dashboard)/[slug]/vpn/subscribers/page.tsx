import { getRemnawaveUsers } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Button, StatusBadge } from "@dub/ui";
import {
  changeSubscriberState,
  createSubscriber,
  removeSubscriber,
  resetSubscriberTraffic,
  revokeSubscriber,
  saveSubscriber,
} from "./actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

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
            <div className="divide-border-subtle divide-y">
              <div className="divide-border-subtle divide-y">
                {users.map((user) => (
                  <div key={user.uuid} className="space-y-4 px-5 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-content-emphasis text-sm font-medium">
                            {user.username}
                          </p>
                          <StatusBadge
                            variant={
                              user.status === "ACTIVE" ? "success" : "neutral"
                            }
                          >
                            {user.status.toLowerCase()}
                          </StatusBadge>
                        </div>
                        <p className="text-content-subtle mt-1 truncate font-mono text-xs">
                          {user.uuid}
                        </p>
                      </div>
                      <a
                        href={user.subscriptionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-neutral-700 underline underline-offset-4"
                      >
                        Open subscription
                      </a>
                    </div>
                    <form
                      action={saveSubscriber}
                      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="uuid" value={user.uuid} />
                      <label className="grid gap-1 text-xs text-neutral-500">
                        Expires
                        <input
                          className={inputClass}
                          type="date"
                          name="expireAt"
                          defaultValue={user.expireAt.slice(0, 10)}
                          required
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-neutral-500">
                        Traffic, GB
                        <input
                          className={inputClass}
                          type="number"
                          name="trafficGb"
                          min={0}
                          step="1"
                          defaultValue={Math.round(
                            user.trafficLimitBytes / 1024 ** 3,
                          )}
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-neutral-500">
                        Reset cycle
                        <select
                          className={inputClass}
                          name="trafficLimitStrategy"
                          defaultValue={user.trafficLimitStrategy}
                        >
                          <option value="NO_RESET">Never</option>
                          <option value="DAY">Daily</option>
                          <option value="WEEK">Weekly</option>
                          <option value="MONTH">Monthly</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs text-neutral-500">
                        Device limit
                        <input
                          className={inputClass}
                          type="number"
                          name="deviceLimit"
                          min={0}
                          defaultValue={user.hwidDeviceLimit || 0}
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-neutral-500 sm:col-span-2">
                        Email
                        <input
                          className={inputClass}
                          type="email"
                          name="email"
                          defaultValue={user.email || ""}
                          placeholder="customer@example.com"
                        />
                      </label>
                      <label className="grid gap-1 text-xs text-neutral-500 sm:col-span-2">
                        Internal note
                        <input
                          className={inputClass}
                          name="description"
                          defaultValue={user.description || ""}
                        />
                      </label>
                      <div className="lg:col-span-4">
                        <OperationSubmit>Save subscriber</OperationSubmit>
                      </div>
                    </form>
                    <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                      <form action={changeSubscriberState}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="uuid" value={user.uuid} />
                        <input
                          type="hidden"
                          name="enabled"
                          value={String(user.status !== "ACTIVE")}
                        />
                        <OperationSubmit>
                          {user.status === "ACTIVE" ? "Disable" : "Enable"}
                        </OperationSubmit>
                      </form>
                      <form action={resetSubscriberTraffic}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="uuid" value={user.uuid} />
                        <OperationSubmit
                          confirmMessage={`Reset traffic for ${user.username}?`}
                        >
                          Reset traffic
                        </OperationSubmit>
                      </form>
                      <form action={revokeSubscriber}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="uuid" value={user.uuid} />
                        <OperationSubmit
                          confirmMessage={`Generate a new subscription link for ${user.username}?`}
                        >
                          Revoke link
                        </OperationSubmit>
                      </form>
                      <form action={removeSubscriber} className="ml-auto">
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="uuid" value={user.uuid} />
                        <OperationSubmit
                          destructive
                          confirmMessage={`Delete ${user.username}? VPN access will stop immediately.`}
                        >
                          Delete
                        </OperationSubmit>
                      </form>
                    </div>
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
