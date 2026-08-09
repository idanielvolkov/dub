import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { CardList } from "@dub/ui";
import { ReactNode } from "react";

export function VpnSectionPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <PageContent title={title} titleInfo={{ title: description }}>
      <PageWidthWrapper className="pb-10">
        <CardList>
          <CardList.Card innerClassName="p-6" hoverStateEnabled={false}>
            <p className="text-content-default max-w-2xl text-sm leading-6">
              {description}
            </p>
            {children}
          </CardList.Card>
        </CardList>
      </PageWidthWrapper>
    </PageContent>
  );
}
