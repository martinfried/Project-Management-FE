import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, Theme } from "@/theme";
import { useTranslation } from "@/i18n";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const getThemeInfo = () => {
    switch (theme) {
      case Theme.System:
        return {
          title: t.theme.switchToLight,
          label: `${t.theme.system} -> ${t.theme.light}`,
          icon: <Monitor className="h-4 w-4 text-muted-foreground transition-transform duration-200" />,
          className: "border-border/80 bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted shadow-2xs",
        };
      case Theme.Light:
        return {
          title: t.theme.switchToDark,
          label: `${t.theme.light} -> ${t.theme.dark}`,
          icon: <Sun className="h-4 w-4 text-amber-500 fill-amber-500/20 transition-transform duration-200 hover:rotate-45" />,
          className: "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:border-amber-500/50 shadow-2xs",
        };
      case Theme.Dark:
        return {
          title: t.theme.switchToSystem,
          label: `${t.theme.dark} -> ${t.theme.system}`,
          icon: <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400/20 transition-transform duration-200 hover:-rotate-12" />,
          className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 shadow-2xs",
        };
    }
  };

  const { title, label, icon, className } = getThemeInfo();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`h-8 w-8 p-0 cursor-pointer transition-all duration-200 ${className}`}
      title={title}
      aria-label={label}
      data-testid="theme-toggle-btn"
    >
      {icon}
    </Button>
  );
}
