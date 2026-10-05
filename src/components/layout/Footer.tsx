import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { api } from "@/services/api";
import { useTranslation } from "@/i18n";
import { useTheme, Theme } from "@/theme";
import teamIcon from "@/assets/team.png";
import teamLightIcon from "@/assets/team-light.png";
import packageJson from "../../../package.json";

export function Footer() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [resetting, setResetting] = useState(false);

  const appIcon = resolvedTheme === Theme.Dark ? teamLightIcon : teamIcon;

  const handleResetDatabase = async () => {
    if (!window.confirm(t.common.confirmReset)) {
      return;
    }
    try {
      setResetting(true);
      await api.initDatabase();
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.common.resetFailed);
    } finally {
      setResetting(false);
    }
  };

  return (
    <footer className="border-t bg-card/40 text-muted-foreground text-xs py-2.5 sm:py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: App Icon, Brand Name & Version */}
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center p-1 shadow-2xs overflow-hidden">
            <img src={appIcon} alt="App Icon" className="h-full w-full object-contain" />
          </div>
          <span className="font-semibold text-foreground">{t.footer.systemTitle}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-muted/70 text-muted-foreground border border-border/60">v{packageJson.version}</span>
        </div>

        {/* Center: Page Links & Reset DB Button */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium" aria-label="Footer Navigation">
          <Link to="/projects" className="hover:text-foreground transition-colors">
            {t.nav.projects}
          </Link>
          <Link to="/teams" className="hover:text-foreground transition-colors">
            {t.nav.teams}
          </Link>
          <Link to="/persons" className="hover:text-foreground transition-colors">
            {t.nav.persons}
          </Link>
          <span className="text-border hidden sm:inline">•</span>
          <a href="http://localhost:8000/api/doc" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <span>{t.footer.swaggerUi}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-border hidden sm:inline">•</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDatabase}
            disabled={resetting}
            className="h-6 px-2 gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t.common.resetDb}
          >
            <Database className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? t.common.resetting : t.common.resetDb}</span>
          </Button>
        </nav>

        {/* Right: Author */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>{t.footer.createdBy}:</span>
          <span className="font-medium text-foreground">{t.footer.author}</span>
        </div>
      </div>
    </footer>
  );
}
