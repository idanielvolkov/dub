import { getGrowthPromotions } from "@/lib/growth/promotions";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Badge, Checkbox, EmptyState, Input } from "@dub/ui";
import { Discount } from "@dub/ui/icons";
import { createPromotion, deletePromotion, updatePromotion } from "./actions";

const Fields = ({
  promotion,
}: {
  promotion?: Awaited<ReturnType<typeof getGrowthPromotions>>[number];
}) => (
  <>
    <label className="grid gap-1 text-xs text-neutral-500">
      Code
      <Input
        className="h-9"
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
      <Input
        className="h-9"
        name="description"
        defaultValue={promotion?.description}
        placeholder="20% off the first month"
        required
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Audience
      <Input
        className="h-9"
        name="audience"
        defaultValue={promotion?.audience}
        placeholder="New subscribers"
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Discount type
      <FormCombobox
        name="discountType"
        defaultValue={promotion?.discountType || "percentage"}
        className="h-9"
        options={[
          { value: "percentage", label: "Percentage" },
          { value: "fixed", label: "Fixed amount" },
        ]}
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Value
      <Input
        className="h-9"
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
      <Input
        className="h-9"
        type="date"
        name="startsAt"
        defaultValue={promotion?.startsAt || ""}
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Ends
      <Input
        className="h-9"
        type="date"
        name="endsAt"
        defaultValue={promotion?.endsAt || ""}
      />
    </label>
    <label className="grid gap-1 text-xs text-neutral-500">
      Redemption limit
      <Input
        className="h-9"
        type="number"
        name="maxRedemptions"
        min={0}
        defaultValue={promotion?.maxRedemptions || 0}
      />
      <span>0 means unlimited</span>
    </label>
    <label className="flex items-center gap-2 self-end pb-2 text-sm">
      <Checkbox
        name="active"
        defaultChecked={promotion?.active ?? false}
        className="size-4"
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
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Create promotion
            </h2>
            <p className="text-content-subtle text-sm">
              Prepare an offer for checkout and customer acquisition
            </p>
          </div>
          <DubCardList>
            <DubCard innerClassName="p-0" hoverStateEnabled={false}>
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
            </DubCard>
          </DubCardList>
        </section>
        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Promotion library
            </h2>
            <p className="text-content-subtle text-sm">
              {promotions.length} saved offers
            </p>
          </div>
          <DubCardList variant="compact">
            {promotions.map((promotion) => (
              <DubCard
                key={promotion.id}
                innerClassName="space-y-4 p-5"
                hoverStateEnabled={false}
              >
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
              </DubCard>
            ))}
          </DubCardList>
          {!promotions.length && (
            <div className="py-12">
              <EmptyState
                icon={Discount}
                title="No promotions yet"
                description="Create the first offer above."
              />
            </div>
          )}
        </section>
        <p className="text-content-subtle mt-4 text-xs">
          The library is ready for checkout validation. Automatic redemption
          counting will activate together with the payment webhook.
        </p>
      </PageWidthWrapper>
    </PageContent>
  );
}
