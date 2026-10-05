import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, Theme } from "@/theme";
import { LanguageProvider } from "@/i18n";
import { AppLayout } from "@/components/layout";
import { Toaster } from "@/components/ui/sonner";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { TeamsPage } from "@/pages/TeamsPage";
import { PersonsPage } from "@/pages/PersonsPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme={Theme.System}>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/persons" element={<PersonsPage />} />
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
}
