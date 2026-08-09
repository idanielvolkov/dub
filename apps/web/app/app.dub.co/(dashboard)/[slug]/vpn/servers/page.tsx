import { redirect } from "next/navigation";

export default async function ServersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}/operations/nodes`);
}
