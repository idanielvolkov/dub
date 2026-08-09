import {
  getRemnawaveSubscriptionSettings,
  getRemnawaveSubscriptionTemplates,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";

export default async function SubscriptionsPage() {
  const [templates, settings] = await Promise.all([
    getRemnawaveSubscriptionTemplates(),
    getRemnawaveSubscriptionSettings(),
  ]);

  return (
    <PageContent
      title="Subscriptions"
      titleInfo={{
        title: "Templates and global Remnawave subscription behavior.",
      }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <VpnMetricCard
            label="Templates"
            value={templates.total}
            detail="Client output formats"
          />
          <VpnMetricCard
            label="Randomize hosts"
            value={settings?.randomizeHosts ? "Enabled" : "Disabled"}
            detail="Global subscription setting"
          />
          <VpnMetricCard
            label="Base JSON"
            value={
              settings?.serveJsonAtBaseSubscription ? "Enabled" : "Disabled"
            }
            detail="Subscription response mode"
          />
        </div>
        <VpnPanel>
          <VpnPanelHeader
            title="Subscription templates"
            description="Formats served to VPN clients"
          />
          <div className="divide-border-subtle divide-y">
            {templates.templates.map((template) => (
              <div
                key={template.uuid}
                className="flex min-h-14 items-center justify-between gap-3 px-5"
              >
                <div>
                  <p className="text-content-emphasis text-sm font-medium">
                    {template.name}
                  </p>
                  <p className="text-content-subtle mt-0.5 font-mono text-xs">
                    {template.uuid}
                  </p>
                </div>
                <Badge variant="gray">{template.templateType}</Badge>
              </div>
            ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
