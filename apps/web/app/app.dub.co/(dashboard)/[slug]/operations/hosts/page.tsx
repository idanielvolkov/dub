import { getRemnawaveHostsState } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { HostsTable } from "@/ui/vpn/hosts-table";
import { ButtonLink, CardList, CardListCard, EmptyState } from "@dub/ui";
import { Refresh2, TriangleWarning } from "@dub/ui/icons";

export default async function HostsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, hostsState] = await Promise.all([
    params,
    getRemnawaveHostsState(),
  ]);
  return (
    <PageContent
      title="Hosts"
      titleInfo={{ title: "Manage subscription hosts." }}
    >
      <PageWidthWrapper className="pb-10">
        {hostsState.error ? (
          <CardList>
            <CardListCard
              hoverStateEnabled={false}
              innerClassName="flex min-h-96 items-center justify-center p-8"
            >
              <EmptyState
                icon={TriangleWarning}
                title="Remnawave is unavailable"
                description={hostsState.error}
              >
                <ButtonLink
                  href={`/${slug}/operations/hosts`}
                  variant="primary"
                >
                  <Refresh2 className="size-4" />
                  Try again
                </ButtonLink>
              </EmptyState>
            </CardListCard>
          </CardList>
        ) : (
          <HostsTable slug={slug} hosts={hostsState.data} />
        )}
      </PageWidthWrapper>
    </PageContent>
  );
}
