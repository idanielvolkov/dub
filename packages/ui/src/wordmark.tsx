import { cn } from "@dub/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      width="84"
      height="24"
      viewBox="0 0 84 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-auto text-black dark:text-white", className)}
      aria-label="detzvpn"
      role="img"
    >
      <text
        x="0"
        y="18"
        fill="currentColor"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize="20"
        fontWeight="700"
        letterSpacing="-1"
      >
        detzvpn
      </text>
    </svg>
  );
}
