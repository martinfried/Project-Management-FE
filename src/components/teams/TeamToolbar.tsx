import { SearchInput } from "@/components/ui/search-input";
import { useTranslation } from "@/i18n";

export interface TeamToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function TeamToolbar({ search, onSearchChange }: TeamToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <SearchInput placeholder={t.teams.searchPlaceholder} value={search} onChange={(e) => onSearchChange(e.target.value)} data-testid="team-search-input" />
    </div>
  );
}
