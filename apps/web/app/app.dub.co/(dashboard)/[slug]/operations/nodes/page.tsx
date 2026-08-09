import { getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel } from "@/ui/vpn/vpn-ui";
import { StatusBadge } from "@dub/ui";
import { changeNodeState, restartNode, saveNode } from "../actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

export default async function NodesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, nodes] = await Promise.all([params, getRemnawaveNodes()]);
  return (
    <PageContent title="Nodes" titleInfo={{ title: "Live Remnawave nodes." }}>
      <PageWidthWrapper className="grid gap-4 pb-10 md:grid-cols-2">
        {nodes.map((node) => (
          <VpnPanel key={node.uuid}>
            <form action={saveNode} className="space-y-4 p-5">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="uuid" value={node.uuid} />
              <div className="flex items-center justify-between gap-3">
                <StatusBadge variant={node.isConnected ? "success" : "pending"}>
                  {node.isConnected ? "Online" : "Offline"}
                </StatusBadge>
                <span className="text-content-subtle text-xs">
                  {node.usersOnline} online
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
                <label className="grid gap-1 text-xs text-neutral-500">
                  Node name
                  <input
                    className={inputClass}
                    name="name"
                    defaultValue={node.name}
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500">
                  Country
                  <input
                    className={inputClass}
                    name="countryCode"
                    defaultValue={node.countryCode}
                    maxLength={2}
                  />
                </label>
              </div>
              <p className="text-content-subtle font-mono text-xs">
                {node.address}:{node.port}
              </p>
              <OperationSubmit>Save changes</OperationSubmit>
            </form>
            <div className="border-border-subtle flex gap-2 border-t p-4">
              <form action={changeNodeState}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={node.uuid} />
                <input
                  type="hidden"
                  name="enabled"
                  value={String(node.isDisabled)}
                />
                <OperationSubmit>
                  {node.isDisabled ? "Enable" : "Disable"}
                </OperationSubmit>
              </form>
              <form action={restartNode}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={node.uuid} />
                <OperationSubmit confirmMessage={`Restart ${node.name}?`}>
                  Restart
                </OperationSubmit>
              </form>
            </div>
          </VpnPanel>
        ))}
      </PageWidthWrapper>
    </PageContent>
  );
}
