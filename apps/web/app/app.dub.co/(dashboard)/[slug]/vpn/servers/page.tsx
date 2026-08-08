import { getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";

export default async function ServersPage() {
  const nodes = await getRemnawaveNodes();

  return (
    <PageContent title="VPN servers">
      <PageWidthWrapper className="py-6">
        <div className="grid gap-4 md:grid-cols-2">
          {nodes.map((node) => (
            <div
              key={node.uuid}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-neutral-950">{node.name}</p>
                  <p className="mt-1 font-mono text-xs text-neutral-500">
                    {node.address}:{node.port}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    node.isConnected
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {node.isConnected ? "Online" : "Connecting"}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Users online</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {node.usersOnline}
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Country</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">
                    {node.countryCode || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
