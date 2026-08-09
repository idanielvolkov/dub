import { getRemnawaveHosts } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { removeHost, saveHost } from "../actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

export default async function HostsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, hosts] = await Promise.all([params, getRemnawaveHosts()]);
  return (
    <PageContent
      title="Hosts"
      titleInfo={{ title: "Remnawave subscription hosts." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnPanel>
          <VpnPanelHeader
            title="Subscription hosts"
            description={`${hosts.length} configured hosts`}
          />
          <div className="divide-border-subtle divide-y">
            {hosts.map((host) => (
              <div key={host.uuid} className="p-5">
                <form
                  action={saveHost}
                  className="grid gap-3 lg:grid-cols-[1fr_1fr_110px_auto] lg:items-end"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={host.uuid} />
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Remark
                    <input
                      className={inputClass}
                      name="remark"
                      defaultValue={host.remark}
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Address
                    <input
                      className={inputClass}
                      name="address"
                      defaultValue={host.address}
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Port
                    <input
                      className={inputClass}
                      name="port"
                      type="number"
                      min={1}
                      max={65535}
                      defaultValue={host.port || 443}
                    />
                  </label>
                  <OperationSubmit>Save</OperationSubmit>
                  <div className="flex gap-5 lg:col-span-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="isDisabled"
                        defaultChecked={host.isDisabled}
                      />{" "}
                      Disabled
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="isHidden"
                        defaultChecked={host.isHidden}
                      />{" "}
                      Hidden
                    </label>
                  </div>
                </form>
                <form action={removeHost} className="mt-3 flex justify-end">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={host.uuid} />
                  <OperationSubmit
                    destructive
                    confirmMessage={`Delete ${host.remark}? This cannot be undone.`}
                  >
                    Delete host
                  </OperationSubmit>
                </form>
              </div>
            ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
