import {
  getRemnawaveSubscriptionSettings,
  getRemnawaveSubscriptionTemplates,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  SubscriptionSettingsButton,
  SubscriptionTemplatesTable,
} from "@/ui/vpn/subscription-settings";
import { MetricCards } from "@dub/ui";

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
        title: "Manage templates and subscription settings.",
      }}
      controls={
        settings ? (
          <SubscriptionSettingsButton slug={slug} settings={settings} />
        ) : undefined
      }
    >
      <PageWidthWrapper className="pb-10">
        <MetricCards
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
        <section>
          <SubscriptionTemplatesTable templates={templates.templates} />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
