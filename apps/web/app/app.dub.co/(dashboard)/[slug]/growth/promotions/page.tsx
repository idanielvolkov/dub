import { getGrowthPromotions } from "@/lib/growth/promotions";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { Badge } from "@dub/ui";
import { createPromotion, deletePromotion, updatePromotion } from "./actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

const Fields = ({
  promotion,
}: {
  promotion?: Awaited<ReturnType<typeof getGrowthPromotions>>[number];
}) => (
  <>
    <label className="grid gap-1 text-xs text-neutral-500">
      Code
      <input
        className={inputClass}
        name="code"
        defaultValue={promotion?.code}
        placeholder="WELCOME20"
        pattern="[A-Za-z0-9_-]+"
        minLength={3}
        maxLength={32}
        required
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500 lg:col-span-2">
      Description
      <input
        className={inputClass}
        name="description"
        defaultValue={promotion?.description}
        placeholder="20% off the first month"
        required
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Audience
      <input
        className={inputClass}
        name="audience"
        defaultValue={promotion?.audience}
        placeholder="New subscribers"
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Discount type
      <select
        className={inputClass}
        name="discountType"
        defaultValue={promotion?.discountType || "percentage"}
      >
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed amount</option>
      </select>
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Value
      <input
        className={inputClass}
        type="number"
        name="discountValue"
        min={0}
        step="1"
        defaultValue={promotion?.discountValue || 0}
        required
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Starts
      <input
        className={inputClass}
        type="date"
        name="startsAt"
        defaultValue={promotion?.startsAt || ""}
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Ends
      <input
        className={inputClass}
        type="date"
        name="endsAt"
        defaultValue={promotion?.endsAt || ""}
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Redemption limit
      <input
        className={inputClass}
        type="number"
        name="maxRedemptions"
        min={0}
        defaultValue={promotion?.maxRedemptions || 0}
      />
      <span>0 means unlimited</span>
    </label>
    <label className="flex items-center gap-2 self-end pb-2 text-sm">
      <input
        type="checkbox"
        name="active"
        defaultChecked={promotion?.active ?? false}
      />{" "}
      Active
    </label>
  </>
);

export default async function PromotionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promotions = await getGrowthPromotions(slug);
  return (
    <PageContent
      title="Promo codes"
      titleInfo={{ title: "Commercial offers managed by the growth team." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnPanel className="mb-4">
          <VpnPanelHeader
            title="Create promotion"
            description="Prepare an offer for checkout and customer acquisition"
          />
          <form
            action={createPromotion}
            className="grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
          >
            <input type="hidden" name="slug" value={slug} />
            <Fields />
            <div className="lg:col-span-4">
              <OperationSubmit>Create promotion</OperationSubmit>
            </div>
          </form>
        </VpnPanel>
        <VpnPanel>
          <VpnPanelHeader
            title="Promotion library"
            description={`${promotions.length} saved offers`}
          />
          <div className="divide-border-subtle divide-y">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <code className="text-content-emphasis text-sm font-semibold">
                      {promotion.code}
                    </code>
                    <Badge variant={promotion.active ? "green" : "gray"}>
                      {promotion.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <span className="text-content-subtle text-xs">
                    {promotion.redemptions} / {promotion.maxRedemptions || "∞"}{" "}
                    redemptions
                  </span>
                </div>
                <form
                  action={updatePromotion}
                  className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
                >
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={promotion.id} />
                  <Fields promotion={promotion} />
                  <div className="lg:col-span-4">
                    <OperationSubmit>Save promotion</OperationSubmit>
                  </div>
                </form>
                <form action={deletePromotion} className="flex justify-end">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={promotion.id} />
                  <OperationSubmit
                    destructive
                    confirmMessage={`Delete promo code ${promotion.code}?`}
                  >
                    Delete
                  </OperationSubmit>
                </form>
              </div>
            ))}
            {!promotions.length && (
              <div className="text-content-subtle p-10 text-center text-sm">
                No promotions yet. Create the first offer above.
              </div>
            )}
          </div>
        </VpnPanel>
        <p className="text-content-subtle mt-4 text-xs">
          The library is ready for checkout validation. Automatic redemption
          counting will activate together with the payment webhook.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
