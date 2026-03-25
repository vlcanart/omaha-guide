"use client";
import { useEffect } from "react";

export function DetailPageScroll() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add("detail-page");
    return () => document.body.classList.remove("detail-page");
  }, []);
  return null;
}
