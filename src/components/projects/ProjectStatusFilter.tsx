import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { getStatusStyle } from "@/components/ui/status-badge";
import { useTranslation } from "@/i18n";
import type { FilterStatus } from "@/types";

export interface ProjectStatusFilterProps {
  value: FilterStatus;
  onChange: (status: FilterStatus) => void;
}

export function ProjectStatusFilter({ value, onChange }: ProjectStatusFilterProps) {
  const { t } = useTranslation();

  const states: { value: FilterStatus; label: string }[] = [
    { value: "Planned", label: t.status["Planned"] },
    { value: "In Progress", label: t.status["In Progress"] },
    { value: "Completed", label: t.status["Completed"] },
    { value: "On Hold", label: t.status["On Hold"] },
  ];

  const allActive = value === "All";
  const allStyle = getStatusStyle("All");

  return (
    <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border text-xs overflow-x-auto">
      <button
        type="button"
        key="All"
        onClick={() => onChange("All")}
        data-testid="status-filter-all"
        aria-pressed={allActive}
        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 border ${
          allActive ? allStyle.activeClass : `border-transparent ${allStyle.inactiveClass}`
        }`}
      >
        <span>{t.common.all}</span>
      </button>

      <div className="h-4 w-px bg-border/70 mx-0.5 shrink-0" />

      {states.map(({ value: statusVal, label }, index) => {
        const isActive = value === statusVal;
        const style = getStatusStyle(statusVal);
        const testId = `status-filter-${statusVal.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <Fragment key={statusVal}>
            {index > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
            <button
              type="button"
              onClick={() => onChange(statusVal)}
              data-testid={testId}
              aria-pressed={isActive}
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 border ${
                isActive ? style.activeClass : `border-transparent ${style.inactiveClass}`
              }`}
            >
              <span>{label}</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
