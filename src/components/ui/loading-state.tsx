import { HTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: "sm" | "default" | "lg";
  iconClassName?: string;
}

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(({ className, text, size = "default", iconClassName, ...props }, ref) => {
  const sizeClasses = {
    sm: "py-6 gap-1.5",
    default: "py-12 gap-2.5",
    lg: "py-16 gap-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-200", sizeClasses[size], className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary shrink-0", iconSizes[size], iconClassName)} />
      {text && <span className="text-xs select-none tracking-tight">{text}</span>}
    </div>
  );
});

LoadingState.displayName = "LoadingState";
