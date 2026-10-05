import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Main } from "./Main";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps = {}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <Main>{children ? children : <Outlet />}</Main>
      <Footer />
    </div>
  );
}
