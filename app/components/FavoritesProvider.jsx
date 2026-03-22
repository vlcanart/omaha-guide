"use client";
import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext({ favs: [], toggle: () => {}, isFav: () => false });

export function FavoritesProvider({ children }) {
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("go-favs");
      if (saved) setFavs(JSON.parse(saved));
    } catch(e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("go-favs", JSON.stringify(favs)); } catch(e) {}
  }, [favs]);

  const toggle = (id) => {
    setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const isFav = (id) => favs.includes(id);

  return (
    <FavoritesContext.Provider value={{ favs, toggle, isFav }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
