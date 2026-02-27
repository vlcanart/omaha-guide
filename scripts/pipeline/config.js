/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Source Registry & Config
 * ═══════════════════════════════════════════════════════════
 */

const SOURCES = [
  // ═══ METRO-WIDE AGGREGATORS ═══
  { id:"visitomaha", name:"Visit Omaha – Events", url:"https://www.visitomaha.com/events/", area:"All Metro", tier:2, priority:5, cats:["all"], strategy:"jina" },
  { id:"reader", name:"The Reader – Events", url:"https://onebox.scenethink.com/the-reader", area:"All Metro", tier:2, priority:6, cats:["arts","concerts"], strategy:"jina" },
  { id:"familyfun", name:"Family Fun in Omaha", url:"https://familyfuninomaha.com/events/", area:"All Metro", tier:2, priority:7, cats:["family"], strategy:"jina" },
  { id:"eventbrite", name:"Eventbrite – Omaha", url:"https://www.eventbrite.com/d/ne--omaha/events/", area:"All Metro", tier:2, priority:8, cats:["all"], strategy:"jina", ticketPlatform:"eventbrite" },
  // Ticket Omaha — now handled by dedicated JSON-LD scraper (scripts/pipeline/ticketomaha.js)
  // { id:"ticketomaha", name:"Ticket Omaha", url:"https://ticketomaha.com/events", area:"All Metro", tier:2, priority:4, cats:["concerts","arts"], strategy:"jina", ticketPlatform:"ticketomaha" },

  // ═══ MAJOR VENUES ═══
  { id:"chi", name:"CHI Health Center", url:"https://chihealthcenteromaha.com/calendar/", area:"Omaha", tier:1, priority:1, cats:["concerts","sports"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"CHI Health Center" },
  { id:"baxter", name:"Baxter Arena", url:"https://www.baxterarena.com/events/", area:"Omaha", tier:1, priority:1, cats:["sports","concerts"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"Baxter Arena" },
  { id:"opa", name:"Omaha Performing Arts", url:"https://o-pa.org/performances/", area:"Omaha", tier:1, priority:1, cats:["concerts","arts"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"Orpheum Theater" },
  { id:"admiral", name:"The Admiral", url:"https://admiralomaha.com/events/", area:"Omaha", tier:1, priority:1, cats:["concerts"], strategy:"jina", ticketPlatform:"etix", venue:"The Admiral" },
  { id:"slowdown", name:"The Slowdown", url:"https://theslowdown.com/events/", area:"Omaha", tier:1, priority:1, cats:["concerts"], strategy:"jina", ticketPlatform:"seetickets", venue:"The Slowdown" },
  { id:"waitingroom", name:"Waiting Room Lounge", url:"https://waitingroomlounge.com/events/", area:"Omaha", tier:1, priority:1, cats:["concerts"], strategy:"jina", ticketPlatform:"etix", venue:"The Waiting Room" },
  { id:"reverb", name:"Reverb Lounge", url:"https://reverblounge.com/events/", area:"Omaha", tier:1, priority:1, cats:["concerts"], strategy:"jina", ticketPlatform:"etix", venue:"Reverb Lounge" },
  { id:"filmstreams", name:"Film Streams", url:"https://filmstreams.org/films", area:"Omaha", tier:1, priority:2, cats:["arts"], strategy:"jina", venue:"Film Streams" },

  // ═══ MUSEUMS & CULTURAL ═══
  { id:"joslyn", name:"Joslyn Art Museum", url:"https://joslyn.org/calendar", area:"Omaha", tier:1, priority:2, cats:["arts"], strategy:"jina", venue:"Joslyn Art Museum" },
  { id:"bemis", name:"Bemis Center", url:"https://www.bemiscenter.org/events", area:"Omaha", tier:1, priority:3, cats:["arts"], strategy:"jina", venue:"Bemis Center" },
  { id:"kaneko", name:"KANEKO", url:"https://thekaneko.org/upcoming-and-current-programs/", area:"Omaha", tier:1, priority:3, cats:["arts"], strategy:"jina", venue:"KANEKO" },
  { id:"hotshops", name:"Hot Shops", url:"https://hotshopsartcenter.org/events/", area:"Omaha", tier:2, priority:4, cats:["arts"], strategy:"jina", venue:"Hot Shops" },
  { id:"playhouse", name:"Omaha Community Playhouse", url:"https://omahaplayhouse.com/calendar/", area:"Omaha", tier:1, priority:2, cats:["arts"], strategy:"jina", venue:"Omaha Community Playhouse" },
  { id:"rose", name:"The Rose Theater", url:"https://rosetheater.org/calendar/", area:"Omaha", tier:1, priority:2, cats:["family","arts"], strategy:"jina", venue:"The Rose Theater" },
  { id:"riverfront", name:"The RiverFront Omaha", url:"https://theriverfrontomaha.com/events/", area:"Omaha", tier:1, priority:3, cats:["festivals","family"], strategy:"jina" },
  { id:"luminarium", name:"Kiewit Luminarium", url:"https://kiewitluminarium.org/events/", area:"Omaha", tier:1, priority:3, cats:["family"], strategy:"jina", venue:"Kiewit Luminarium" },
  { id:"lauritzen", name:"Lauritzen Gardens", url:"https://www.lauritzengardens.org/Calendar/", area:"Omaha", tier:1, priority:3, cats:["family"], strategy:"jina", venue:"Lauritzen Gardens" },
  { id:"durham", name:"The Durham Museum", url:"https://durhammuseum.org/calendar/", area:"Omaha", tier:1, priority:3, cats:["arts","family"], strategy:"jina", venue:"The Durham Museum" },
  { id:"zoo", name:"Omaha Zoo – Special Events", url:"https://www.omahazoo.com/special-events", area:"Omaha", tier:1, priority:2, cats:["family"], strategy:"jina", venue:"Henry Doorly Zoo" },

  // ═══ OMAHA DISTRICTS ═══
  { id:"aksarben", name:"Aksarben Village", url:"https://www.aksarbenvillage.com/events", area:"Omaha", tier:2, priority:5, cats:["festivals","family"], strategy:"jina" },
  { id:"midtown", name:"Midtown Crossing", url:"https://midtowncrossing.com/things-to-do/events/", area:"Omaha", tier:2, priority:5, cats:["festivals","concerts"], strategy:"jina" },
  { id:"oldmarket", name:"Old Market", url:"https://oldmarket.com/events", area:"Omaha", tier:2, priority:5, cats:["festivals","arts"], strategy:"jina" },
  { id:"blackstone", name:"Blackstone District", url:"https://www.blackstonedistrict.com/blackstone-calendar-events-omaha", area:"Omaha", tier:2, priority:5, cats:["festivals","concerts"], strategy:"jina" },
  { id:"benson", name:"Experience Benson", url:"https://www.experiencebenson.com/", area:"Omaha", tier:2, priority:6, cats:["festivals","concerts"], strategy:"jina" },
  { id:"bensontheatre", name:"Benson Theatre", url:"https://bensontheatre.org/calendar/", area:"Omaha", tier:2, priority:4, cats:["arts","concerts"], strategy:"jina", venue:"Benson Theatre" },

  // ═══ COUNCIL BLUFFS ═══
  { id:"unleashcb", name:"Unleash CB", url:"https://www.unleashcb.com/events/calendar/", area:"Council Bluffs", tier:2, priority:5, cats:["all"], strategy:"jina" },
  { id:"cbcity", name:"CB – Special Events", url:"https://www.councilbluffs-ia.gov/2300/Events", area:"Council Bluffs", tier:2, priority:6, cats:["festivals","family"], strategy:"jina" },
  { id:"midamerica", name:"Mid-America Center", url:"https://www.caesars.com/mid-america-center/upcoming-events", area:"Council Bluffs", tier:1, priority:2, cats:["concerts","sports"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"Mid-America Center" },
  { id:"stircove", name:"Stir Cove (Harrah's)", url:"https://www.caesars.com/harrahs-council-bluffs/shows", area:"Council Bluffs", tier:1, priority:2, cats:["concerts"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"Stir Concert Cove" },
  { id:"paceevents", name:"PACE – Events", url:"https://www.paceartsiowa.org/events", area:"Council Bluffs", tier:2, priority:5, cats:["arts"], strategy:"jina" },
  { id:"pacecal", name:"PACE – Calendar", url:"https://www.paceartsiowa.org/calendar", area:"Council Bluffs", tier:2, priority:5, cats:["arts"], strategy:"jina" },
  { id:"iwcc", name:"Iowa Western Arts Center", url:"https://artscenter.iwcc.edu/calendar-of-events/", area:"Council Bluffs", tier:2, priority:5, cats:["arts"], strategy:"jina" },
  { id:"cblibrary", name:"CB Public Library", url:"https://www.councilbluffslibrary.org/events/upcoming", area:"Council Bluffs", tier:2, priority:7, cats:["family"], strategy:"jina" },

  // ═══ PAPILLION / LA VISTA / RALSTON ═══
  { id:"papillion", name:"City of Papillion", url:"https://www.papillion.org/calendar.aspx", area:"Papillion", tier:2, priority:5, cats:["family","festivals"], strategy:"jina" },
  { id:"sumtur", name:"SumTur Amphitheater", url:"https://www.papillion.org/calendar.aspx?CID=27", area:"Papillion", tier:1, priority:3, cats:["concerts","festivals"], strategy:"jina", venue:"SumTur Amphitheater" },
  { id:"landing", name:"Papillion Landing", url:"https://www.papillionlanding.com/calendar.aspx?CID=34", area:"Papillion", tier:2, priority:6, cats:["family"], strategy:"jina" },
  { id:"wernerspecial", name:"Werner Park – Special", url:"https://www.milb.com/omaha/ballpark/special-events", area:"Papillion", tier:1, priority:3, cats:["family","sports"], strategy:"jina", venue:"Werner Park" },
  { id:"werneraxs", name:"Werner Park (AXS)", url:"https://www.axs.com/venues/130047/werner-park-papillion-tickets", area:"Papillion", tier:2, priority:4, cats:["concerts","sports"], strategy:"jina", ticketPlatform:"axs", venue:"Werner Park" },
  { id:"lavista", name:"City of La Vista", url:"https://www.cityoflavista.org/Calendar.aspx", area:"La Vista", tier:2, priority:6, cats:["family","festivals"], strategy:"jina" },
  { id:"lavistacitycentre", name:"La Vista City Centre", url:"https://lavistacitycentre.com/community-events/", area:"La Vista", tier:2, priority:5, cats:["festivals","family"], strategy:"jina" },
  { id:"astro", name:"The Astro Theater", url:"https://lavistacitycentre.com/theastro/", area:"La Vista", tier:1, priority:1, cats:["concerts"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"The Astro" },
  { id:"libertyfirst", name:"Liberty First CU Arena", url:"https://www.libertyfirstcreditunionarena.com/events", area:"Ralston", tier:1, priority:2, cats:["sports","concerts"], strategy:"jina", ticketPlatform:"ticketmaster", venue:"Liberty First Credit Union Arena" },

  // ═══ GRETNA ═══
  { id:"gretnacal", name:"City of Gretna", url:"https://www.gretnane.org/calendar.aspx?CID=19", area:"Gretna", tier:2, priority:6, cats:["family","festivals"], strategy:"jina" },
  { id:"gretnadays", name:"Gretna Days Festival", url:"https://gretnadays.com/", area:"Gretna", tier:2, priority:5, cats:["festivals"], strategy:"jina" },
  { id:"musiccrossing", name:"Music at the Crossing", url:"https://www.gretnane.org/264/Music-at-the-Crossing", area:"Gretna", tier:2, priority:5, cats:["concerts"], strategy:"jina" },

  // ═══ WIDER NET ═══
  { id:"visitne", name:"Visit Nebraska", url:"https://visitnebraska.com/events/calendar", area:"Wider Net", tier:2, priority:9, cats:["all"], strategy:"jina" },
  { id:"traveliowa", name:"Travel Iowa", url:"https://www.traveliowa.com/calendar/", area:"Wider Net", tier:2, priority:9, cats:["all"], strategy:"jina" },
];

// ═══ AFFILIATE / TICKETING CONFIG ═══
const AFFILIATE_CONFIG = {
  ticketmaster: {
    paramName: "at_aid", affiliateId: process.env.TICKETMASTER_AFFILIATE_ID || "",
    rewriteUrl: (url, id) => { if(!id) return url; const u=new URL(url); u.searchParams.set("at_aid",id); return u.toString(); },
    domains: ["ticketmaster.com","livenation.com"],
  },
  etix: {
    paramName: "partner", affiliateId: process.env.ETIX_AFFILIATE_ID || "",
    rewriteUrl: (url, id) => { if(!id) return url; const u=new URL(url); u.searchParams.set("partner",id); return u.toString(); },
    domains: ["etix.com"],
  },
  axs: {
    paramName: "aff", affiliateId: process.env.AXS_AFFILIATE_ID || "",
    rewriteUrl: (url, id) => { if(!id) return url; const u=new URL(url); u.searchParams.set("aff",id); return u.toString(); },
    domains: ["axs.com"],
  },
  eventbrite: {
    paramName: "aff", affiliateId: process.env.EVENTBRITE_AFFILIATE_ID || "",
    rewriteUrl: (url, id) => { if(!id) return url; const u=new URL(url); u.searchParams.set("aff",id); return u.toString(); },
    domains: ["eventbrite.com"],
  },
  seetickets: {
    paramName: "ref", affiliateId: process.env.SEETICKETS_AFFILIATE_ID || "",
    rewriteUrl: (url, id) => { if(!id) return url; const u=new URL(url); u.searchParams.set("ref",id); return u.toString(); },
    domains: ["seetickets.us"],
  },
};

// ═══ CATEGORY KEYWORD PATTERNS ═══
const CATEGORY_KEYWORDS = {
  concerts: /\b(concert|live music|band|singer|songwriter|dj|tour|acoustic|symphony|orchestra|jazz|blues|rock|country|hip.?hop|edm|folk|indie|pop|metal|punk|emo|r&b)\b/i,
  comedy:   /\b(comedy|comedian|stand.?up|improv|sketch|open mic|funny|humor|roast)\b/i,
  sports:   /\b(basketball|football|soccer|hockey|baseball|volleyball|wrestling|boxing|mma|lancers|mavericks|storm chasers|union omaha|creighton|husker|bluejay)\b/i,
  festivals:/\b(festival|fest|fiesta|fair|block party|celebration|parade|market|crawl|5k|run|walk|gala|fundraiser|taste of)\b/i,
  family:   /\b(kids|children|family|zoo|safari|easter|halloween|christmas|holiday|sensory|storytime|puppet|magic show|camp|craft|workshop)\b/i,
  arts:     /\b(art|gallery|exhibit|theater|theatre|play|musical|ballet|dance|opera|film|cinema|reading|poetry|lecture|book|author|museum)\b/i,
};

module.exports = { SOURCES, AFFILIATE_CONFIG, CATEGORY_KEYWORDS };
