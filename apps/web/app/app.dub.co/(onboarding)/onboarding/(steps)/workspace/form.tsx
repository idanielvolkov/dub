"use client";

import { CreateWorkspaceForm } from "@/ui/workspaces/create-workspace-form";
import { useOnboardingProgress } from "../../use-onboarding-progress";

export function Form() {
  const { finish } = useOnboardingProgress();

  return (
    <CreateWorkspaceForm
      className="w-full"
      onSuccess={({ slug }) => finish({ slug })}
    />
  );
}
