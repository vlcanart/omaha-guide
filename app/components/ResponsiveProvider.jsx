"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ResponsiveContext = createContext({ w: 375, isM: true, isT: false, isD: false });

export function ResponsiveProvider({ children }) {
  const [w, setW] = useState(375);

  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isD = w >= 960, isT = w >= 600 && w < 960, isM = w < 600;

  return (
    <ResponsiveContext.Provider value={{ w, isM, isT, isD }}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  return useContext(ResponsiveContext);
}
