import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { ProjectStatus, FilterStatus } from "@/types";

export type { ProjectStatus, FilterStatus };

export type StatusBadgeSize = "sm" | "default";

export interface StatusStyleConfig {
  readonly activeClass: string;
  readonly inactiveClass: string;
  readonly badgeClass: string;
}

export const PROJECT_STATUSES: readonly ProjectStatus[] = ["Planned", "In Progress", "Completed", "On Hold"] as const;

export const FILTER_STATUSES: readonly FilterStatus[] = ["All", ...PROJECT_STATUSES] as const;

export const STATUS_STYLES: Readonly<Record<ProjectStatus, StatusStyleConfig>> = {
  Planned: {
    activeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/60 dark:border-blue-600/60 shadow-xs font-semibold",
    inactiveClass: "text-blue-600/80 dark:text-blue-400/80 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  "In Progress": {
    activeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/60 dark:border-amber-600/60 shadow-xs font-semibold",
    inactiveClass: "text-amber-600/80 dark:text-amber-400/80 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  Completed: {
    activeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/60 dark:border-emerald-600/60 shadow-xs font-semibold",
    inactiveClass: "text-emerald-600/80 dark:text-emerald-400/80 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  "On Hold": {
    activeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/60 dark:border-purple-600/60 shadow-xs font-semibold",
    inactiveClass: "text-purple-600/80 dark:text-purple-400/80 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-500/10",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
} as const;

export const ALL_STATUS_STYLE: StatusStyleConfig = {
  activeClass: "bg-background text-foreground border-border shadow-xs font-semibold",
  inactiveClass: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
  badgeClass: "bg-muted/60 text-muted-foreground border-border",
} as const;

export function isProjectStatus(status: unknown): status is ProjectStatus {
  return typeof status === "string" && (PROJECT_STATUSES as readonly string[]).includes(status);
}

export function getStatusStyle(status?: FilterStatus | ProjectStatus | null): StatusStyleConfig {
  if (!status || status === "All" || !isProjectStatus(status)) {
    return ALL_STATUS_STYLE;
  }
  return STATUS_STYLES[status];
}

export interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  size?: StatusBadgeSize;
}

export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const { t } = useTranslation();
  const style = isProjectStatus(status) ? STATUS_STYLES[status] : ALL_STATUS_STYLE;
  const label = t.status[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium select-none tracking-tight",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs",
        style.badgeClass,
        className,
      )}
    >
      <span>{label}</span>
    </span>
  );
}
