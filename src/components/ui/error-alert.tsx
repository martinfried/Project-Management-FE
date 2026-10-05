import { HTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export interface ErrorAlertProps extends HTMLAttributes<HTMLDivElement> {
  message?: string | null;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorAlert = forwardRef<HTMLDivElement, ErrorAlertProps>(({ className, message, onRetry, retryText, children, ...props }, ref) => {
  const { t } = useTranslation();

  if (!message && !children) {
    return null;
  }

  return (
    <div ref={ref} role="alert" className={cn("rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center gap-3", className)} {...props}>
      <AlertCircle className="h-5 w-5 shrink-0" />
      <div className="flex-1 text-xs">{children || message}</div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="h-7 text-xs">
          {retryText || t.common.retry}
        </Button>
      )}
    </div>
  );
});

ErrorAlert.displayName = "ErrorAlert";
