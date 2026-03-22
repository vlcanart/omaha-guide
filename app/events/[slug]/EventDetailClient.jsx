"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useFavorites } from "../../components/FavoritesProvider";
import { useResponsive } from "../../components/ResponsiveProvider";
import { T } from "../../lib/design-tokens";

const EventDetail = dynamic(() => import("../../EventDetail"), { ssr: false });

export function EventDetailClient({ event }) {
  const router = useRouter();
  const { isFav, toggle } = useFavorites();
  const { isM, isT, isD } = useResponsive();

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <EventDetail
        event={event}
        isSaved={isFav(event.id)}
        onToggleSave={() => toggle(event.id)}
        onBack={() => router.push("/")}
        isM={isM}
        isT={isT}
        isD={isD}
      />
    </div>
  );
}
