import { getGrowthPromotions } from "@/lib/growth/promotions";
import {
  CreatePromotionButton,
  PromotionFields,
} from "@/ui/growth/promotion-actions";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { Badge, EmptyState } from "@dub/ui";
import { Discount } from "@dub/ui/icons";
import { deletePromotion, updatePromotion } from "./actions";

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
      controls={<CreatePromotionButton slug={slug} />}
    >
      <PageWidthWrapper className="pb-10">
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
                  <PromotionFields promotion={promotion} />
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
