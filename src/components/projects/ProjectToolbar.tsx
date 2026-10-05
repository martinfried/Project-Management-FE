import { SearchInput } from "@/components/ui/search-input";
import { ProjectStatusFilter } from "@/components/projects/ProjectStatusFilter";
import { useTranslation } from "@/i18n";
import type { FilterStatus } from "@/types";

export interface ProjectToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
}

export function ProjectToolbar({ search, onSearchChange, statusFilter, onStatusFilterChange }: ProjectToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <SearchInput placeholder={t.projects.searchPlaceholder} value={search} onChange={(e) => onSearchChange(e.target.value)} data-testid="project-search-input" />
      <ProjectStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
    </div>
  );
}
