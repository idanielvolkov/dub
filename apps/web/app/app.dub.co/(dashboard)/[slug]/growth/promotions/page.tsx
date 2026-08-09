import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";

const promotions = [
  {
    code: "WELCOME",
    offer: "First month discount",
    audience: "New subscribers",
    status: "Draft",
  },
  {
    code: "ANNUAL",
    offer: "Annual plan incentive",
    audience: "Monthly subscribers",
    status: "Draft",
  },
];

export default function PromotionsPage() {
  return (
    <PageContent
      title="Promo codes"
      titleInfo={{ title: "Commercial offers prepared by the growth team." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnPanel>
          <VpnPanelHeader
            title="Promotion library"
            description="Offers are kept separate from technical VPN configuration"
          />
          <div className="divide-border-subtle divide-y">
            {promotions.map((promotion) => (
              <div
                key={promotion.code}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[140px_1fr_1fr_90px] sm:items-center"
              >
                <code className="text-content-emphasis text-sm font-semibold">
                  {promotion.code}
                </code>
                <span className="text-sm">{promotion.offer}</span>
                <span className="text-content-subtle text-sm">
                  {promotion.audience}
                </span>
                <Badge variant="gray">{promotion.status}</Badge>
              </div>
            ))}
          </div>
        </VpnPanel>
        <p className="text-content-subtle mt-4 text-xs">
          Payment-provider redemption rules will be connected when automated
          billing is enabled.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
