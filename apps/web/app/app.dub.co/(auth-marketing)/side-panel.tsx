import { cn } from "@dub/utils";
import { CustomerLogos } from "./customer-logos";

export function SidePanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden border-l border-black/5 bg-neutral-50 min-[900px]:flex">
      {/* Gradient at bottom */}
      {[...Array(2)].map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute bottom-0 left-1/2 size-[80px] -translate-x-1/2 translate-y-1/2 scale-x-[1.6]",
            idx === 0 ? "mix-blend-overlay" : "opacity-15",
          )}
        >
          {[...Array(idx === 0 ? 2 : 1)].map((_, innerIdx) => (
            <div
              key={innerIdx}
              className={cn(
                "absolute -inset-16 mix-blend-overlay blur-[50px] saturate-[2]",
                "bg-[conic-gradient(from_90deg,#F00_5deg,#EAB308_63deg,#5CFF80_115deg,#1E00FF_170deg,#855AFC_220deg,#3A8BFD_286deg,#F00_360deg)]",
              )}
            />
          ))}
        </div>
      ))}

      {/* Testimonial section - vertically centered */}
      <div className="relative flex grow items-center justify-center p-8 lg:p-14">
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/12] overflow-hidden rounded-xl border border-neutral-900/10 bg-neutral-950 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,.32),transparent_42%)]" />
            <div className="relative flex h-full items-center justify-center">
              <div className="relative flex size-40 items-center justify-center rounded-full border border-white/20">
                <div className="absolute inset-5 rounded-full border border-white/10" />
                <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
                <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
                <div className="size-3 animate-pulse rounded-full bg-white shadow-[0_0_32px_rgba(255,255,255,.8)]" />
                {[
                  "-left-3 top-8",
                  "-right-2 top-16",
                  "bottom-2 left-5",
                  "bottom-5 right-1",
                ].map((position) => (
                  <div
                    key={position}
                    className={`absolute ${position} size-2 rounded-full bg-blue-400 shadow-[0_0_16px_rgba(96,165,250,.9)]`}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-content-default max-w-[370px] text-pretty text-xl font-medium">
            Run your VPN business from one fast, secure control center
          </p>
          <p className="max-w-[390px] text-sm leading-6 text-neutral-500">
            Subscribers, access links, traffic, plans, and four VPN locations —
            managed through Detz and powered by Remnawave.
          </p>
        </div>
      </div>

      <CustomerLogos />
    </div>
  );
}
