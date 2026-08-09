import {
  getRemnawaveConfigProfiles,
  getRemnawaveSquads,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { addSquad, removeSquad, saveProfile, saveSquad } from "../actions";

const inputClass =
  "h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400";

export default async function ConfigurationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, profiles, squads] = await Promise.all([
    params,
    getRemnawaveConfigProfiles(),
    getRemnawaveSquads(),
  ]);
  const inboundIds = profiles.configProfiles.flatMap((profile) =>
    profile.inbounds
      .map((inbound) => (inbound as { uuid?: string }).uuid)
      .filter((uuid): uuid is string => Boolean(uuid)),
  );
  return (
    <PageContent
      title="Profiles & squads"
      titleInfo={{ title: "Xray profiles and internal access squads." }}
    >
      <PageWidthWrapper className="grid gap-4 pb-10 lg:grid-cols-2">
        <VpnPanel>
          <VpnPanelHeader
            title="Configuration profiles"
            description={`${profiles.total} profiles · advanced JSON editor`}
          />
          <div className="divide-border-subtle divide-y">
            {profiles.configProfiles.map((profile) => (
              <form
                key={profile.uuid}
                action={saveProfile}
                className="space-y-3 p-5"
              >
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={profile.uuid} />
                <label className="grid gap-1 text-xs text-neutral-500">
                  Profile name
                  <input
                    className={inputClass}
                    name="name"
                    defaultValue={profile.name}
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs text-neutral-500">
                  Xray JSON
                  <textarea
                    className="min-h-56 rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs outline-none focus:border-neutral-400"
                    name="config"
                    defaultValue={JSON.stringify(profile.config, null, 2)}
                    spellCheck={false}
                  />
                </label>
                <OperationSubmit confirmMessage="Apply this Xray configuration to the profile?">
                  Validate & save
                </OperationSubmit>
              </form>
            ))}
          </div>
        </VpnPanel>
        <VpnPanel>
          <VpnPanelHeader
            title="Internal squads"
            description={`${squads.total} access groups`}
          />
          <div className="divide-border-subtle divide-y">
            {squads.internalSquads.map((squad) => (
              <div key={squad.uuid} className="p-5">
                <form action={saveSquad} className="space-y-3">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={squad.uuid} />
                  <input
                    type="hidden"
                    name="inbounds"
                    value={squad.inbounds
                      .map((item) => (item as { uuid?: string }).uuid)
                      .filter(Boolean)
                      .join(",")}
                  />
                  <label className="grid gap-1 text-xs text-neutral-500">
                    Squad name
                    <input
                      className={inputClass}
                      name="name"
                      defaultValue={squad.name}
                      required
                    />
                  </label>
                  <p className="text-content-subtle text-xs">
                    {squad.info?.membersCount || 0} members ·{" "}
                    {squad.inbounds.length} inbounds
                  </p>
                  <OperationSubmit>Save</OperationSubmit>
                </form>
                <form action={removeSquad} className="mt-3 flex justify-end">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={squad.uuid} />
                  <OperationSubmit
                    destructive
                    confirmMessage={`Delete ${squad.name}? Users may lose access.`}
                  >
                    Delete squad
                  </OperationSubmit>
                </form>
              </div>
            ))}
            <form action={addSquad} className="space-y-3 bg-neutral-50 p-5">
              <input type="hidden" name="slug" value={slug} />
              <input
                type="hidden"
                name="inbounds"
                value={inboundIds.join(",")}
              />
              <p className="text-content-emphasis text-sm font-medium">
                Create access squad
              </p>
              <input
                className={`${inputClass} w-full`}
                name="name"
                placeholder="Marketing-VPN"
                minLength={2}
                maxLength={20}
                pattern="[A-Za-z0-9_-]+"
                required
              />
              <OperationSubmit>Create squad</OperationSubmit>
            </form>
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
