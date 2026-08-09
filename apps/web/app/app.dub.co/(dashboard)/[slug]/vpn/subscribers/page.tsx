import { redirect } from "next/navigation";

export default async function SubscribersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}/operations/users`);
}
