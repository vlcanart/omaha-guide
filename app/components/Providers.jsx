"use client";
import { FavoritesProvider } from "./FavoritesProvider";
import { ResponsiveProvider } from "./ResponsiveProvider";

export function Providers({ children }) {
  return (
    <ResponsiveProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </ResponsiveProvider>
  );
}
