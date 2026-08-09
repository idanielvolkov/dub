import type { WorkspaceProps } from "@/lib/types";
import { fetcher } from "@dub/utils";
import { useParams, useSearchParams } from "next/navigation";
import useSWR, { SWRConfiguration } from "swr";

export default function useWorkspace({
  swrOpts,
}: {
  swrOpts?: SWRConfiguration;
} = {}) {
  let { slug } = useParams() as { slug: string | null };
  const searchParams = useSearchParams();
  if (!slug) slug = searchParams.get("slug") || searchParams.get("workspace");

  const { data, error, mutate } = useSWR<WorkspaceProps[]>(
    slug && "/api/workspaces",
    fetcher,
    { dedupingInterval: 60000, ...swrOpts },
  );
  const workspace = data?.find((item) => item.slug === slug);

  return {
    ...workspace,
    id: workspace?.id,
    slug: workspace?.slug ?? slug ?? undefined,
    role: workspace?.users?.[0]?.role || "member",
    isOwner: workspace?.users?.[0]?.role === "owner",
    error,
    mutate,
    loading: Boolean(slug && !workspace && !error),
  };
}
