import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FolderKanban, Users, Layers, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import { useTheme, Theme } from "@/theme";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import teamIcon from "@/assets/team.png";
import teamLightIcon from "@/assets/team-light.png";

export function Header() {
  const { t } = useTranslation();
  const { theme, resolvedTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const appIcon = resolvedTheme === Theme.Dark ? teamLightIcon : teamIcon;

  // Close mobile menu on route changes
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  const isHomepage = location.pathname === "/" || location.pathname === "/projects";

  const navLinks = [
    { to: "/projects", label: t.nav.projects, icon: FolderKanban },
    { to: "/teams", label: t.nav.teams, icon: Layers },
    { to: "/persons", label: t.nav.persons, icon: Users },
  ];

  return (
    <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-6 lg:gap-8 min-w-0 flex-1 md:flex-initial">
          {isHomepage ? (
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-default select-none min-w-0">
              <div className="h-9 w-9 sm:h-9 sm:w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 shadow-xs overflow-hidden shrink-0">
                <img src={appIcon} alt="App Icon" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl sm:text-base md:text-lg font-bold sm:font-semibold leading-tight text-foreground tracking-tight truncate">{t.common.appName}</span>
            </div>
          ) : (
            <NavLink to="/projects" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-85 transition-opacity cursor-pointer min-w-0" title={t.common.appName}>
              <div className="h-9 w-9 sm:h-9 sm:w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 shadow-xs overflow-hidden shrink-0">
                <img src={appIcon} alt="App Icon" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl sm:text-base md:text-lg font-bold sm:font-semibold leading-tight text-foreground tracking-tight truncate">{t.common.appName}</span>
            </NavLink>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                data-testid={`nav-${to.replace("/", "")}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-primary text-primary-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme & Language (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            data-testid="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden h-9 w-9 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-menu-drawer"
          className="md:hidden border-t bg-card/95 backdrop-blur-md px-4 py-3.5 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150 shadow-md"
        >
          {/* Mobile Preferences: Theme & Language (First Row) */}
          <div data-testid="mobile-preferences-row" className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <span className="text-xs font-medium text-muted-foreground">{theme === Theme.System ? t.theme.system : theme === Theme.Dark ? t.theme.dark : t.theme.light}</span>
            </div>
            <LanguageSwitcher />
          </div>

          <nav data-testid="mobile-nav" className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-primary text-primary-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
