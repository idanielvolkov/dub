import { redirect } from "next/navigation";

export default async function GrowthTasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}/growth`);
}
