import {
  getRemnawaveSubscriptionSettings,
  getRemnawaveSubscriptionTemplates,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge, Checkbox, EmptyState } from "@dub/ui";
import { QRCode } from "@dub/ui/icons";
import { saveSubscriptionSettings } from "../actions";

export default async function SubscriptionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, templates, settings] = await Promise.all([
    params,
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
        {settings && (
          <VpnPanel className="mb-4">
            <VpnPanelHeader
              title="Global behavior"
              description="Applied to every generated subscription"
            />
            <form
              action={saveSubscriptionSettings}
              className="flex flex-wrap items-center gap-5 p-5"
            >
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="uuid" value={settings.uuid} />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  name="randomizeHosts"
                  defaultChecked={settings.randomizeHosts}
                  className="size-4"
                />{" "}
                Randomize hosts
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  name="serveJsonAtBaseSubscription"
                  defaultChecked={settings.serveJsonAtBaseSubscription}
                  className="size-4"
                />{" "}
                Serve base JSON
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  name="isShowCustomRemarks"
                  defaultChecked={settings.isShowCustomRemarks}
                  className="size-4"
                />{" "}
                Custom remarks
              </label>
              <div className="ml-auto">
                <OperationSubmit>Save settings</OperationSubmit>
              </div>
            </form>
          </VpnPanel>
        )}
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
            {!templates.templates.length && (
              <div className="p-10">
                <EmptyState
                  icon={QRCode}
                  title="No subscription templates"
                  description="Create a template in Remnawave to display it here."
                />
              </div>
            )}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
