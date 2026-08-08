import { getRemnawaveUsers } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { createSubscriber } from "./actions";

export default async function SubscribersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { users, total } = await getRemnawaveUsers();

  return (
    <PageContent title="Subscribers">
      <PageWidthWrapper className="py-6">
        <form
          action={createSubscriber}
          className="mb-4 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_150px_auto]"
        >
          <input type="hidden" name="slug" value={slug} />
          <input
            name="username"
            required
            minLength={3}
            placeholder="Subscriber name"
            className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
          />
          <select
            name="durationDays"
            defaultValue="30"
            className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add subscriber
          </button>
        </form>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <p className="font-medium text-neutral-950">VPN subscribers</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {total} subscriber{total === 1 ? "" : "s"} in Remnawave
              </p>
            </div>
            <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
              Live data
            </div>
          </div>
          {users.length ? (
            <div className="divide-y divide-neutral-100">
              {users.map((user) => (
                <div
                  key={user.uuid}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 sm:grid-cols-[1fr_140px_160px]"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-950">
                      {user.username}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {user.uuid}
                    </p>
                  </div>
                  <span className="hidden text-sm capitalize text-neutral-600 sm:block">
                    {user.status.toLowerCase()}
                  </span>
                  <span className="text-right text-xs text-neutral-500">
                    {new Date(user.expireAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-xl">
                ◉
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-950">
                No subscribers yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                New VPN subscribers created in Detz will appear here instantly.
              </p>
            </div>
          )}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
