import { getGrowthPromotions } from "@/lib/growth/promotions";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { Badge, Checkbox, EmptyState, Input, Label } from "@dub/ui";
import { Discount } from "@dub/ui/icons";
import { createPromotion, deletePromotion, updatePromotion } from "./actions";

const Fields = ({
  promotion,
}: {
  promotion?: Awaited<ReturnType<typeof getGrowthPromotions>>[number];
}) => {
  const fieldPrefix = promotion ? `promotion-${promotion.id}` : "new-promotion";

  return <>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-code`}>Code</Label>
      <Input
        id={`${fieldPrefix}-code`}
        className="h-9"
        name="code"
        defaultValue={promotion?.code}
        placeholder="WELCOME20"
        pattern="[A-Za-z0-9_-]+"
        minLength={3}
        maxLength={32}
        required
      />
    </div>
    <div className="grid gap-1.5 lg:col-span-2">
      <Label htmlFor={`${fieldPrefix}-description`}>Description</Label>
      <Input
        id={`${fieldPrefix}-description`}
        className="h-9"
        name="description"
        defaultValue={promotion?.description}
        placeholder="20% off the first month"
        required
      />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-audience`}>Audience</Label>
      <Input
        id={`${fieldPrefix}-audience`}
        className="h-9"
        name="audience"
        defaultValue={promotion?.audience}
        placeholder="New subscribers"
      />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-discount-type`}>Discount type</Label>
      <FormCombobox
        id={`${fieldPrefix}-discount-type`}
        name="discountType"
        defaultValue={promotion?.discountType || "percentage"}
        className="h-9"
        options={[
          { value: "percentage", label: "Percentage" },
          { value: "fixed", label: "Fixed amount" },
        ]}
      />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-value`}>Value</Label>
      <Input
        id={`${fieldPrefix}-value`}
        className="h-9"
        type="number"
        name="discountValue"
        min={0}
        step="1"
        defaultValue={promotion?.discountValue || 0}
        required
      />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-starts`}>Starts</Label>
      <Input
        id={`${fieldPrefix}-starts`}
        className="h-9"
        type="date"
        name="startsAt"
        defaultValue={promotion?.startsAt || ""}
      />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-ends`}>Ends</Label>
      <Input
        id={`${fieldPrefix}-ends`}
        className="h-9"
        type="date"
        name="endsAt"
        defaultValue={promotion?.endsAt || ""}
      />
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor={`${fieldPrefix}-limit`}>Redemption limit</Label>
      <Input
        id={`${fieldPrefix}-limit`}
        className="h-9"
        type="number"
        name="maxRedemptions"
        min={0}
        defaultValue={promotion?.maxRedemptions || 0}
      />
      <span className="text-content-subtle text-xs">0 means unlimited</span>
    </div>
    <Label
      htmlFor={`${fieldPrefix}-active`}
      className="flex cursor-pointer items-center gap-2 self-end pb-2 font-normal"
    >
      <Checkbox
        id={`${fieldPrefix}-active`}
        name="active"
        defaultChecked={promotion?.active ?? false}
        className="size-4"
      />{" "}
      Active
    </Label>
  </>
};

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
