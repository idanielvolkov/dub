import { NextRequest, NextResponse } from "next/server";
import {
  ONBOARDING_WINDOW_SECONDS,
  onboardingStepCache,
} from "../api/workspaces/onboarding-step-cache";
import { appRedirect } from "./utils/app-redirect";
import { getDefaultWorkspace } from "./utils/get-default-workspace";
import { getUserViaToken } from "./utils/get-user-via-token";
import { hasPendingInvites } from "./utils/has-pending-invites";
import { isTopLevelSettingsRedirect } from "./utils/is-top-level-settings-redirect";
import { parse } from "./utils/parse";
import { WorkspacesMiddleware } from "./workspaces";

export async function AppMiddleware(req: NextRequest) {
  const { path, fullPath, searchParamsString } = parse(req);

  const user = await getUserViaToken(req);

  // if there's no user and the path is not a public page, redirect to /login
  if (
    !user &&
    path !== "/login" &&
    path !== "/forgot-password" &&
    path !== "/register" &&
    !path.startsWith("/auth/reset-password/") &&
    !path.startsWith("/unsubscribe/")
  ) {
    return NextResponse.redirect(
      new URL(
        `/login${path === "/" ? "" : `?next=${encodeURIComponent(fullPath)}`}`,
        req.url,
      ),
    );

    // if there's a user
  } else if (user) {
    /* Onboarding redirects

        - User was created less than a day ago
        - User is not invited to a workspace (redirect straight to the workspace)
        - The path does not start with /onboarding
        - User doesn't have a default workspace
        - User has not completed the onboarding flow
      */
    if (
      new Date(user.createdAt).getTime() >
        Date.now() - ONBOARDING_WINDOW_SECONDS * 1000 &&
      !["/onboarding", "/account"].some((p) => path.startsWith(p)) &&
      !(await getDefaultWorkspace(user)) &&
      !(await hasPendingInvites({ req, user })) &&
      (await onboardingStepCache.get({ userId: user.id })) !== "completed"
    ) {
      const step = await onboardingStepCache.get({ userId: user.id });
      if (!step) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      } else if (step === "completed") {
        return WorkspacesMiddleware(req, user);
      }

      return NextResponse.redirect(new URL(`/onboarding/${step}`, req.url));

      // if the path is / or /login or /register, redirect to the default workspace
    } else if (
      [
        "/",
        "/login",
        "/register",
        "/workspaces",
        "/links",
        "/analytics",
        "/events",
        "/upgrade",
        "/guides",
        "/wrapped",
        "/programs",
        // here we have separate logic for the root paths instead of path.startsWith("/program")
        // because some workspace slugs are program-something which will break
        "/program",
        "/customers",
        "/settings",
      ].includes(path) ||
      path.startsWith("/program/") ||
      path.startsWith("/customers/") ||
      path.startsWith("/settings/") ||
      isTopLevelSettingsRedirect(path)
    ) {
      return WorkspacesMiddleware(req, user);
    }

    const appRedirectPath = await appRedirect(path);
    if (appRedirectPath) {
      return NextResponse.redirect(
        new URL(`${appRedirectPath}${searchParamsString}`, req.url),
      );
    }
  }

  // otherwise, rewrite the path to /app
  return NextResponse.rewrite(new URL(`/app.dub.co${fullPath}`, req.url));
}
