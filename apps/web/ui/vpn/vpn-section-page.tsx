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
    <PageContent title={title}>
      <PageWidthWrapper className="py-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="max-w-2xl text-sm leading-6 text-neutral-600">
            {description}
          </p>
          {children}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
