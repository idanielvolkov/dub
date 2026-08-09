import { getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { NodesTable } from "@/ui/vpn/nodes-table";

export default async function NodesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, nodes] = await Promise.all([params, getRemnawaveNodes()]);
  return (
    <PageContent title="Nodes" titleInfo={{ title: "Live Remnawave nodes." }}>
      <PageWidthWrapper className="pb-10">
        <NodesTable slug={slug} nodes={nodes} />
      </PageWidthWrapper>
    </PageContent>
  );
}
