const FEATURES = [
  "Global network",
  "Live monitoring",
  "Instant access",
  "Secure by design",
];

export function CustomerLogos() {
  return (
    <div className="relative z-10 mx-auto flex max-w-md flex-wrap items-center justify-center gap-3 px-8 pb-12 pt-6 lg:px-10">
      {FEATURES.map((feature, index) => (
        <span
          key={feature}
          className="animate-fade-in-blur rounded-full border border-neutral-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-neutral-600 opacity-0 backdrop-blur [animation-fill-mode:forwards]"
          style={{ animationDelay: `${500 + index * 120}ms` }}
        >
          {feature}
        </span>
      ))}
    </div>
  );
}
