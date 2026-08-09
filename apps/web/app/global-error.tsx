"use client";

import { useEffect } from "react";

type RecoveryWindow = Window & {
  __detzRecoverFromClientError?: (error?: unknown) => boolean;
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const diagnostic = [error.name, error.message, error.digest]
    .filter(Boolean)
    .join(": ");

  useEffect(() => {
    const recoveryStarted = (
      window as RecoveryWindow
    ).__detzRecoverFromClientError?.(error);

    if (!recoveryStarted) {
      console.error("[detz] Unrecoverable client error", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#e5e5e5",
          color: "#171717",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <main
          style={{
            display: "grid",
            minHeight: "100vh",
            placeItems: "center",
            padding: 24,
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: 420,
              border: "1px solid #d4d4d4",
              borderRadius: 12,
              background: "#fff",
              padding: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,.06)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700 }}>detzvpn</div>
            <h1 style={{ margin: "24px 0 8px", fontSize: 18 }}>
              We couldn't load this page
            </h1>
            <p
              style={{
                margin: "0 0 20px",
                color: "#737373",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Detz will refresh automatically when an outdated browser bundle is
              detected. If the problem persists, open the diagnostic details
              below.
            </p>
            <details
              style={{
                margin: "0 0 20px",
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                padding: 12,
                fontSize: 12,
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                Diagnostic details
              </summary>
              <pre
                style={{
                  margin: "12px 0 0",
                  maxHeight: 160,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#525252",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
              >
                {diagnostic || "Unknown client error"}
                {error.stack ? `\n\n${error.stack}` : ""}
              </pre>
            </details>
            <button
              type="button"
              onClick={reset}
              style={{
                width: "100%",
                height: 40,
                border: "1px solid #000",
                borderRadius: 8,
                background: "#000",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
