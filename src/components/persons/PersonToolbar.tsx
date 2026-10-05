import { SearchInput } from "@/components/ui/search-input";
import { useTranslation } from "@/i18n";

export interface PersonToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function PersonToolbar({ search, onSearchChange }: PersonToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <SearchInput placeholder={t.persons.searchPlaceholder} value={search} onChange={(e) => onSearchChange(e.target.value)} data-testid="person-search-input" />
    </div>
  );
}
