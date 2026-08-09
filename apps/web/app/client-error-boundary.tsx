"use client";

import { Component, ErrorInfo, ReactNode } from "react";

type State = {
  error: Error | null;
  componentStack: string;
};

export class ClientErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null, componentStack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? "" });
    console.error("[detz] React component crash", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-[#e5e5e5] p-6">
        <section className="w-full max-w-xl rounded-xl border border-neutral-300 bg-white p-6 shadow-lg">
          <div className="text-xl font-bold">detzvpn</div>
          <h1 className="mt-6 text-lg font-semibold">React diagnostic</h1>
          <p className="mt-2 text-sm text-neutral-500">
            The component stack below identifies the exact broken element.
          </p>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
            {this.state.error.message}
            {"\n\nComponent stack:\n"}
            {this.state.componentStack || "Capturing component stack…"}
          </pre>
        </section>
      </main>
    );
  }
}
