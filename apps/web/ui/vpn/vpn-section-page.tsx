import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
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
        <div className="border-border-subtle bg-bg-default rounded-xl border p-6">
          <p className="text-content-default max-w-2xl text-sm leading-6">
            {description}
          </p>
          {children}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
