import { getGrowthPromotions } from "@/lib/growth/promotions";
import { CreatePromotionButton } from "@/ui/growth/promotion-actions";
import { PromotionsTable } from "@/ui/growth/promotions-table";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";

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
      titleInfo={{ title: "Manage offers and discount codes." }}
      controls={<CreatePromotionButton slug={slug} />}
    >
      <PageWidthWrapper className="pb-10">
        <PromotionsTable slug={slug} promotions={promotions} />
      </PageWidthWrapper>
    </PageContent>
  );
}
