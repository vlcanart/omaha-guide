// app/events/[slug]/page.jsx
// SERVER COMPONENT — no "use client"
// Generates static HTML with JSON-LD + OG metadata at build time.

import { SEED_EVENTS } from "../../data/events";
import { INGESTED_EVENTS } from "../../events-data";
import { eventSlug, findEventBySlug, getAllEventSlugs, eventJsonLd, eventMeta } from "../event-utils";
import ConcertEventClient from "./ConcertEventClient";

var VENUE_MAP = {
  "The Waiting Room": { lat: 41.281, lng: -95.954, cap: "400", area: "Benson", type: "Indie / Club", url: "https://waitingroomlounge.com", addr: "6212 Maple St, Omaha, NE 68104" },
  "The Slowdown": { lat: 41.2691, lng: -95.9251, cap: "500", area: "North Downtown", type: "Indie / Club", url: "https://theslowdown.com", addr: "729 N 14th St, Omaha, NE 68102" },
  "Steelhouse Omaha": { lat: 41.258, lng: -95.937, cap: "3,000", area: "North Downtown", type: "Performing Arts", url: "https://steelhouseomaha.com", addr: "1228 Harney St, Omaha, NE 68102" },
  "The Astro": { lat: 41.2105, lng: -96.0475, cap: "2,500", area: "La Vista", type: "Arena", url: "https://www.theastrotheater.com", addr: "12100 Westport Pkwy, La Vista, NE 68128" },
  "Orpheum Theater": { lat: 41.2582, lng: -95.9352, cap: "2,600", area: "Downtown", type: "Performing Arts", url: "https://o-pa.org", addr: "409 S 16th St, Omaha, NE 68102" },
  "Holland PAC": { lat: 41.2606, lng: -95.9313, cap: "2,000", area: "Downtown", type: "Performing Arts", url: "https://o-pa.org", addr: "1200 Douglas St, Omaha, NE 68102" },
  "CHI Health Center": { lat: 41.2628, lng: -95.9257, cap: "18,300", area: "North Downtown", type: "Arena", url: "https://www.chihealthcenteromaha.com", addr: "455 N 10th St, Omaha, NE 68102" },
  "Reverb Lounge": { lat: 41.2808, lng: -95.9545, cap: "150", area: "Benson", type: "Indie / Club", url: "https://reverblounge.com", addr: "6121 Military Ave, Omaha, NE 68104" },
  "The Admiral": { lat: 41.2525, lng: -95.9355, cap: "1,500", area: "Little Bohemia", type: "Indie / Club", url: "https://www.admiralomaha.com", addr: "2218 S 13th St, Omaha, NE 68108" },
  "Barnato": { lat: 41.262, lng: -96.073, cap: "600", area: "West Omaha", type: "Indie / Club", url: "https://barnato.bar", addr: "13110 Birch Dr, Omaha, NE 68164" },
  "Stir Concert Cove": { lat: 41.233, lng: -95.854, cap: "4,000", area: "Council Bluffs", type: "Outdoor", url: "https://www.stircove.com", addr: "1 Harrahs Blvd, Council Bluffs, IA 51501" },
  "Liberty First CU Arena": { lat: 41.2033, lng: -96.0395, cap: "4,600", area: "Ralston", type: "Arena", url: "https://www.libertyfirstcreditunionarena.com", addr: "7300 Q St, Ralston, NE 68127" },
  "Baxter Arena": { lat: 41.2382, lng: -96.0115, cap: "7,898", area: "Aksarben", type: "Arena", url: "https://baxterarena.com", addr: "2425 S 67th St, Omaha, NE 68106" },
  "Werner Park": { lat: 41.1183, lng: -96.0945, cap: "9,023", area: "Papillion", type: "Outdoor", url: "https://www.milb.com/omaha", addr: "12356 Ballpark Way, Papillion, NE 68046" },
  "Morrison Stadium": { lat: 41.263, lng: -95.937, cap: "7,000", area: "Downtown", type: "Outdoor", url: "https://gocreighton.com", addr: "2500 California Plaza, Omaha, NE 68178" },
  "Memorial Stadium": { lat: 40.8206, lng: -96.7056, cap: "86,000", area: "Lincoln", type: "Stadium", url: "https://huskers.com", addr: "1 Memorial Stadium Dr, Lincoln, NE 68588" },
  "Funny Bone Comedy Club": { lat: 41.258, lng: -96.07, cap: "350", area: "West Omaha", type: "Comedy Club", url: "https://omaha.funnybone.com", addr: "17305 Davenport St, Omaha, NE 68118" },
  "North Omaha Music & Arts": { lat: 41.28, lng: -95.95, cap: "200", area: "North Omaha", type: "Community", url: "#", addr: "North Omaha, NE" },
};

var TEAMS={
  "creighton":{name:"Creighton Bluejays",abbr:"CU",color:"#005CA9",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/156.png"},
  "bluejays":{name:"Creighton Bluejays",abbr:"CU",color:"#005CA9",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/156.png"},
  "nebraska":{name:"Nebraska Huskers",abbr:"NEB",color:"#E41C38",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/158.png"},
  "huskers":{name:"Nebraska Huskers",abbr:"NEB",color:"#E41C38",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/158.png"},
  "omaha":{name:"Omaha Mavericks",abbr:"UNO",color:"#000000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png"},
  "mavericks":{name:"Omaha Mavericks",abbr:"UNO",color:"#000000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2437.png"},
  "storm chasers":{name:"Storm Chasers",abbr:"OMA",color:"#003DA5",logo:""},
  "union omaha":{name:"Union Omaha",abbr:"UO",color:"#1C2B39",logo:""},
  "supernovas":{name:"Omaha Supernovas",abbr:"SUP",color:"#E8364F",logo:""},
  "lancers":{name:"Omaha Lancers",abbr:"OL",color:"#003DA5",logo:""},
  "iowa":{name:"Iowa",abbr:"IOW",color:"#FFCD00",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png"},
  "kansas":{name:"Kansas",abbr:"KU",color:"#0051BA",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png"},
  "villanova":{name:"Villanova",abbr:"NOVA",color:"#00205B",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/222.png"},
  "marquette":{name:"Marquette",abbr:"MARQ",color:"#003366",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/269.png"},
  "xavier":{name:"Xavier",abbr:"XAV",color:"#0C2340",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2752.png"},
  "uconn":{name:"UConn",abbr:"UCONN",color:"#000E2F",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/41.png"},
  "butler":{name:"Butler",abbr:"BUT",color:"#13294B",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2166.png"},
  "depaul":{name:"DePaul",abbr:"DPU",color:"#005EB8",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/305.png"},
  "seton hall":{name:"Seton Hall",abbr:"SHU",color:"#004488",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2550.png"},
  "st. john":{name:"St. John's",abbr:"SJU",color:"#C8102E",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2599.png"},
  "georgetown":{name:"Georgetown",abbr:"GTOWN",color:"#041E42",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/46.png"},
  "providence":{name:"Providence",abbr:"PROV",color:"#000000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/2507.png"},
  "wisconsin":{name:"Wisconsin",abbr:"WIS",color:"#C5050C",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/275.png"},
  "minnesota":{name:"Minnesota",abbr:"MINN",color:"#7A0019",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/135.png"},
  "michigan":{name:"Michigan",abbr:"MICH",color:"#00274C",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/130.png"},
  "ohio state":{name:"Ohio State",abbr:"OSU",color:"#BB0000",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"},
  "penn state":{name:"Penn State",abbr:"PSU",color:"#041E42",logo:"https://a.espncdn.com/i/teamlogos/ncaa/500/213.png"},
};

function enrichSports(ev) {
  if (ev.cat !== "sports" || ev.matchup) return ev;
  var t = (ev.title || "").toLowerCase();
  var enriched = Object.assign({}, ev);

  // Parse "Team A v Team B" or "Team A vs Team B"
  var vsMatch = t.match(/^(.+?)\s+(?:v\.?\s*|vs\.?\s+)(.+?)(?:\s+at\s+|\s*$)/i);
  if (vsMatch) {
    var findTeam = function(str) {
      var s = str.trim().toLowerCase();
      for (var k in TEAMS) { if (s.includes(k)) return Object.assign({}, TEAMS[k]); }
      var words = str.trim().split(/\s+/);
      var abbr = words.map(function(w) { return w[0]; }).join("").toUpperCase().slice(0, 4);
      return { name: str.trim(), abbr: abbr, color: "#64B5F6", logo: "" };
    };
    var teamA = findTeam(vsMatch[1]);
    var teamB = findTeam(vsMatch[2]);
    var venL = (ev.venue || "").toLowerCase();
    var homeIsFirst = venL.includes("baxter") || venL.includes("morrison") || t.includes("creighton") || t.includes("husker") || t.includes("nebraska");
    enriched.matchup = { home: homeIsFirst ? teamA : teamB, away: homeIsFirst ? teamB : teamA };
  }

  // Detect sport type
  var venL2 = (ev.venue || "").toLowerCase();
  var sport = "Sports";
  if (t.includes("basketball") || venL2.includes("chi health center") || venL2.includes("baxter arena")) sport = "Basketball";
  else if (t.includes("baseball") || venL2.includes("schwab") || venL2.includes("werner")) sport = "Baseball";
  else if (t.includes("volleyball") || t.includes("supernovas") || venL2.includes("devaney")) sport = "Volleyball";
  else if (t.includes("football") || venL2.includes("memorial stadium")) sport = "Football";
  else if (t.includes("hockey") || t.includes("lancers") || venL2.includes("ice")) sport = "Hockey";
  else if (t.includes("soccer") || t.includes("union omaha") || venL2.includes("caniglia")) sport = "Soccer";
  else if (t.includes("wrestling")) sport = "Wrestling";
  enriched.sportType = enriched.sportType || sport;
  if (enriched.matchup) enriched.matchup.sportType = enriched.sportType;

  // Auto-generate tags if missing
  if (!enriched.tags || enriched.tags.length === 0) {
    var tags = [sport];
    if (t.includes("bluejay") || t.includes("creighton")) tags.push("Big East", "Creighton");
    else if (t.includes("husker") || t.includes("nebraska")) tags.push("Big Ten", "Nebraska");
    else if (t.includes("maverick") || t.includes("uno")) tags.push("Summit League", "UNO");
    else if (t.includes("storm chaser")) tags.push("Minor League Baseball", "Triple-A");
    else if (t.includes("union omaha")) tags.push("USL League One");
    else if (t.includes("supernovas")) tags.push("Pro Volleyball", "LOVB");
    else if (t.includes("lancers")) tags.push("USHL", "Junior Hockey");
    tags.push("Live Sports");
    enriched.tags = tags;
  }

  return enriched;
}

function getAllEvents() {
  try {
    var seed = Array.isArray(SEED_EVENTS) ? SEED_EVENTS : [];
    var ingested = Array.isArray(INGESTED_EVENTS) ? INGESTED_EVENTS : [];
    return [...seed, ...ingested];
  } catch(e) { return []; }
}

export async function generateStaticParams() {
  var events = getAllEvents();
  var eligible = events.filter(function(ev) { return ev.cat === "concerts" || ev.cat === "sports"; });
  return getAllEventSlugs(eligible);
}

export async function generateMetadata({ params }) {
  var slug = (await params).slug;
  var ev = findEventBySlug(getAllEvents(), slug);
  if (!ev) return { title: "Event Not Found | GO: Guide to Omaha" };
  return eventMeta(ev);
}

export default async function EventPage({ params }) {
  var slug = (await params).slug;
  var events = getAllEvents();
  var ev = findEventBySlug(events, slug);

  if (!ev) {
    return (
      <div style={{ minHeight: "100vh", background: "#141618", color: "#F2EFE9", fontFamily: "'Inter',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 40 }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Event Not Found</h1>
        <p style={{ color: "rgba(242,239,233,0.58)", marginBottom: 20 }}>This event may have passed or been removed.</p>
        <a href="/" style={{ color: "#5EC4B6", textDecoration: "none" }}>Back to GO: Guide to Omaha</a>
      </div>
    );
  }

  // Enrich sports events at build time
  ev = enrichSports(ev);

  var venue = VENUE_MAP[ev.venue] || null;
  var jsonLd = eventJsonLd(ev, venue);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "GO Omaha", item: "https://go-omaha.com" },
          { "@type": "ListItem", position: 2, name: "Events", item: "https://go-omaha.com/#events" },
          { "@type": "ListItem", position: 3, name: ev.title, item: "https://go-omaha.com/events/" + slug },
        ],
      }) }} />
      <ConcertEventClient event={ev} venue={venue} slug={slug} />
    </>
  );
}
