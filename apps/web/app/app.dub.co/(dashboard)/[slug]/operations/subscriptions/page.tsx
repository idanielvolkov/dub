import {
  getRemnawaveSubscriptionSettings,
  getRemnawaveSubscriptionTemplates,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, CardList, Checkbox, EmptyState } from "@dub/ui";
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
        <VpnStats
          className="mb-6"
          items={[
            {
              label: "Templates",
              value: templates.total,
              detail: "Client output formats",
            },
            {
              label: "Randomize hosts",
              value: settings?.randomizeHosts ? "Enabled" : "Disabled",
              detail: "Global subscription setting",
            },
            {
              label: "Base JSON",
              value: settings?.serveJsonAtBaseSubscription
                ? "Enabled"
                : "Disabled",
              detail: "Subscription response mode",
            },
          ]}
        />
        {settings && (
          <section className="mb-6">
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Global behavior
              </h2>
              <p className="text-content-subtle text-sm">
                Applied to every generated subscription
              </p>
            </div>
            <CardList>
              <CardList.Card innerClassName="p-5" hoverStateEnabled={false}>
                <form
                  action={saveSubscriptionSettings}
                  className="flex flex-wrap items-center gap-5"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={settings.uuid} />
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      name="randomizeHosts"
                      defaultChecked={settings.randomizeHosts}
                      className="size-4"
                    />
                    Randomize hosts
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      name="serveJsonAtBaseSubscription"
                      defaultChecked={settings.serveJsonAtBaseSubscription}
                      className="size-4"
                    />
                    Serve base JSON
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      name="isShowCustomRemarks"
                      defaultChecked={settings.isShowCustomRemarks}
                      className="size-4"
                    />
                    Custom remarks
                  </label>
                  <div className="ml-auto">
                    <OperationSubmit>Save settings</OperationSubmit>
                  </div>
                </form>
              </CardList.Card>
            </CardList>
          </section>
        )}
        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Subscription templates
            </h2>
            <p className="text-content-subtle text-sm">
              Formats served to VPN clients
            </p>
          </div>
          <CardList variant="compact">
            {templates.templates.map((template) => (
              <CardList.Card key={template.uuid} hoverStateEnabled={false}>
                <div className="flex min-h-9 items-center justify-between gap-3">
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
              </CardList.Card>
            ))}
          </CardList>
          {!templates.templates.length && (
            <div className="py-12">
              <EmptyState
                icon={QRCode}
                title="No subscription templates"
                description="Create a template in Remnawave to display it here."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
