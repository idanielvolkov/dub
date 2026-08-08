import { getRemnawaveHealth } from "@/lib/remnawave/client";
import { VpnSectionPage } from "@/ui/vpn/vpn-section-page";

export default async function SystemPage() {
  const health = await getRemnawaveHealth();
  return (
    <VpnSectionPage
      title="System"
      description="Technical operations remain powered by Remnawave, while access and actions are surfaced safely inside Detz VPN."
    >
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
        <span
          className={`size-2 rounded-full ${health.connected ? "bg-green-500" : "bg-amber-400"}`}
        />
        <span className="font-medium text-neutral-900">Remnawave API</span>
        <span className="text-neutral-500">
          {health.connected ? "Connected" : "Connection pending"}
        </span>
      </div>
    </VpnSectionPage>
  );
}
