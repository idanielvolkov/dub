import { geistMono, inter, satoshi } from "@/styles/fonts";
import "@/styles/globals.css";
import { cn, constructMetadata } from "@dub/utils";
import Script from "next/script";
import { ClientErrorBoundary } from "./client-error-boundary";
import RootProviders from "./providers";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(satoshi.variable, inter.variable, geistMono.variable)}
    >
      <body>
        <ClientErrorBoundary>
          <RootProviders>{children}</RootProviders>
        </ClientErrorBoundary>

        <Script id="recover-stale-client-bundle" strategy="beforeInteractive">
          {`
          (() => {
            const recoveryKey = "detz:last-client-recovery";

            window.__detzRecoverFromClientError = (error) => {
              const now = Date.now();
              const previousRecovery = Number(sessionStorage.getItem(recoveryKey) || 0);

              if (now - previousRecovery < 30000) return false;

              sessionStorage.setItem(recoveryKey, String(now));
              const url = new URL(window.location.href);
              url.searchParams.set("__detz_reload", String(now));
              window.location.replace(url.toString());
              return true;
            };

            const isStaleBundleError = (value) => {
              const message = String(value?.message || value?.reason?.message || value?.reason || value || "");
              return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|module script.*failed|CSS_CHUNK_LOAD_FAILED|Minified React error #130|Element type is invalid/i.test(message);
            };

            window.addEventListener("error", (event) => {
              if (isStaleBundleError(event.error || event.message)) {
                window.__detzRecoverFromClientError(event.error || event.message);
              }
            });

            window.addEventListener("unhandledrejection", (event) => {
              if (isStaleBundleError(event.reason)) {
                window.__detzRecoverFromClientError(event.reason);
              }
            });
          })();
        `}
        </Script>

        <Script id="set-theme" strategy="beforeInteractive">
          {`
          (() => {
            // Only run on referrals embed page for now
            if (window.location.pathname !== '/embed/referrals') return;

            const urlParams = new URLSearchParams(window.location.search);
            const theme = urlParams.get('theme');

            if (theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
              document.body.classList.add("dark");
            } else {
              document.body.classList.remove("dark");
            }
          })();
        `}
        </Script>
      </body>
    </html>
  );
}
