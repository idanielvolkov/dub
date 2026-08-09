import { cn } from "@dub/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div>
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:border-neutral-500 focus:ring-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 sm:text-sm",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && (
        <span className="mt-2 block text-sm text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  ),
);

Textarea.displayName = "Textarea";
