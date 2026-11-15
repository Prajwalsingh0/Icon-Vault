// @ts-nocheck
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CompareProvider } from "@/lib/compare";
import { CollectionsProvider } from "@/lib/collections";
import { FavoritesProvider } from "@/lib/favorites";
import { librarySearch } from "@/lib/library-search";
import { searchFocus } from "@/lib/search-focus";
import { ThemeProvider } from "@/lib/theme";

export function AppShell({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active?.isContentEditable) return;
      event.preventDefault();
      const field = document.querySelector("[data-search-input]");
      if (field) {
        field.focus();
        return;
      }
      searchFocus.pending = true;
      navigate({ to: "/library", search: librarySearch({}) });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CollectionsProvider>
          <CompareProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          </CompareProvider>
        </CollectionsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
