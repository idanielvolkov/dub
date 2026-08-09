"use client";

import useWorkspaces from "@/lib/swr/use-workspaces";
import { useAddWorkspaceModal } from "@/ui/modals/add-workspace-modal";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  Suspense,
  createContext,
  useEffect,
} from "react";
import { useUpgradedModal } from "./upgraded-modal";

export const ModalContext = createContext<{
  setShowAddWorkspaceModal: Dispatch<SetStateAction<boolean>>;
  setShowAddEditDomainModal: Dispatch<SetStateAction<boolean>>;
  setShowLinkBuilder: Dispatch<SetStateAction<boolean>>;
  setShowAddEditTagModal: Dispatch<SetStateAction<boolean>>;
  setShowImportBitlyModal: Dispatch<SetStateAction<boolean>>;
  setShowImportShortModal: Dispatch<SetStateAction<boolean>>;
  setShowImportRebrandlyModal: Dispatch<SetStateAction<boolean>>;
  setShowImportCsvModal: Dispatch<SetStateAction<boolean>>;
  setShowImportPartnerStackModal: Dispatch<SetStateAction<boolean>>;
  setShowImportRewardfulModal: Dispatch<SetStateAction<boolean>>;
  setShowImportToltModal: Dispatch<SetStateAction<boolean>>;
  setShowImportTapfiliateModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowAddWorkspaceModal: () => {},
  setShowAddEditDomainModal: () => {},
  setShowLinkBuilder: () => {},
  setShowAddEditTagModal: () => {},
  setShowImportBitlyModal: () => {},
  setShowImportShortModal: () => {},
  setShowImportRebrandlyModal: () => {},
  setShowImportCsvModal: () => {},
  setShowImportPartnerStackModal: () => {},
  setShowImportRewardfulModal: () => {},
  setShowImportToltModal: () => {},
  setShowImportTapfiliateModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ModalProviderClient>{children}</ModalProviderClient>
    </Suspense>
  );
}

function ModalProviderClient({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { AddWorkspaceModal, setShowAddWorkspaceModal } =
    useAddWorkspaceModal();
  const { setShowUpgradedModal, UpgradedModal } = useUpgradedModal();

  useEffect(() => {
    if (searchParams.has("upgraded")) {
      setShowUpgradedModal(true);
    }
  }, [searchParams]);

  // Handle workspace creation from the global navigation.
  useEffect(() => {
    if (searchParams.has("newWorkspace")) {
      setShowAddWorkspaceModal(true);
    }
  }, []);

  const { data: session, update } = useSession();
  const { workspaces } = useWorkspaces();

  // if user has workspaces but no defaultWorkspace, refresh to get defaultWorkspace
  useEffect(() => {
    if (
      workspaces &&
      workspaces.length > 0 &&
      session?.user &&
      !session.user["defaultWorkspace"]
    ) {
      fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultWorkspace: workspaces[0].slug,
        }),
      }).then(() => update());
    }
  }, [session]);

  return (
    <ModalContext.Provider
      value={{
        setShowAddWorkspaceModal,
        setShowAddEditDomainModal: () => {},
        setShowLinkBuilder: () => {},
        setShowAddEditTagModal: () => {},
        setShowImportBitlyModal: () => {},
        setShowImportShortModal: () => {},
        setShowImportRebrandlyModal: () => {},
        setShowImportCsvModal: () => {},
        setShowImportPartnerStackModal: () => {},
        setShowImportRewardfulModal: () => {},
        setShowImportToltModal: () => {},
        setShowImportTapfiliateModal: () => {},
      }}
    >
      <AddWorkspaceModal />
      <UpgradedModal />
      {children}
    </ModalContext.Provider>
  );
}
