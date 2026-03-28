

/* ══════════════════════════════════════════════
   HENRY DOORLY ZOO — COMPREHENSIVE DATA
   ══════════════════════════════════════════════ */

export const ZOO_INFO = {
  name: "Omaha's Henry Doorly Zoo & Aquarium",
  address: "3701 S 10th St, Omaha, NE 68107",
  phone: "(402) 733-8401",
  web: "https://omahazoo.com",
  lat: 41.226,
  lng: -95.9287,
  acres: 160,
  animals: "17,000+",
  species: 962,
  badge: "#1 Zoo in the World",
  badgeSub: "USA Today Best Zoo — 4 Consecutive Years",
  img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-1.jpg",
  blurb: "Consistently ranked the #1 zoo in the world by USA Today and TripAdvisor. Spanning 160 acres with 17,000+ animals across 962 species, Henry Doorly Zoo is home to the world's largest indoor desert, largest nocturnal exhibit, and one of North America's largest indoor rainforests. Seven acres of climate-controlled indoor exhibits ensure a world-class experience year-round.",
};

/* ── Seasonal Hours ── */
export const ZOO_SEASONS = [
  { id: "summer", label: "Summer", dates: "Apr 1 – Nov 3", grounds: "9 AM – 5 PM", buildings: "Close at 6 PM", months: [4, 5, 6, 7, 8, 9, 10] },
  { id: "winter", label: "Winter", dates: "Nov 4 – Mar 31", grounds: "10 AM – 4 PM", buildings: "Close at 5 PM", months: [11, 12, 1, 2, 3] },
];

export function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  return ZOO_SEASONS.find(s => s.months.includes(m)) || ZOO_SEASONS[1];
}

/* ── Admission Pricing ── */
export const ZOO_PRICING = {
  seasons: [
    { label: "Summer", dates: "May 1 – Sep 30", adult: "$33.95", child: "$25.95", senior: "$30.55" },
    { label: "Spring / Fall", dates: "Mar 1 – Apr 30, Oct 1 – Nov 30", adult: "$28.95", child: "$20.95", senior: "$25.95" },
    { label: "Winter", dates: "Dec 1 – Feb 28", adult: "$21.95", child: "$14.95", senior: "$19.75" },
  ],
  notes: ["Children under 2: FREE", "Military discounts available", "Parking is always FREE"],
  membership: [
    { type: "Individual", price: "$109/yr" },
    { type: "Dual", price: "$155/yr" },
    { type: "Household", price: "$205/yr" },
    { type: "Military", price: "$185/yr" },
  ],
  memberPerks: ["Unlimited zoo visits", "Free IMAX films", "5% off food & gift shop", "Discounted special events", "Reciprocal admission at 50+ zoos", "Monthly member perks"],
};

/* ── Exhibits ── */
export const ZOO_EXHIBITS = [
  {
    id: "desert-dome", name: "Desert Dome", icon: "🏜️", cat: "indoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-2.jpg",
    tagline: "World's Largest Indoor Desert",
    desc: "A 137-foot glazed geodesic dome sheltering three desert ecosystems — the Namib Desert of southern Africa, Australia's Red Center, and the Sonoran Desert of North America. One of the zoo's most iconic structures.",
    animals: ["Namib sand vipers", "Roadrunners", "Warthogs", "Sand cats", "Monitor lizards"],
    highlights: ["Largest glazed geodesic dome in the world", "Three distinct desert biomes", "$31.5M construction (opened 2002)"],
    award: "USA Today #1 Best Zoo Exhibit",
  },
  {
    id: "kingdoms", name: "Kingdoms of the Night", icon: "🦇", cat: "indoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-3.jpg",
    tagline: "World's Largest Nocturnal Exhibit",
    desc: "Located beneath the Desert Dome, this 42,000 sq ft underground experience features nocturnal animals in six themed environments — wet cave, canyon, African diorama, eucalyptus forest, dry bat cave, and swamp.",
    animals: ["Bats", "Aardvarks", "Pangolins", "Owls", "Bushbabies", "Cave fish"],
    highlights: ["42,000 sq ft underground", "14-foot deep cave aquarium", "Six themed nocturnal habitats"],
  },
  {
    id: "lied-jungle", name: "Lied Jungle", icon: "🌴", cat: "indoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-1.jpg",
    tagline: "Nation's Largest Indoor Rainforest",
    desc: "Walk through a lush indoor rainforest spanning habitats from South America, Asia, and Africa. Suspension bridges, waterfalls, and 90+ animal species living among tropical vegetation.",
    animals: ["Pygmy hippos", "Gibbons", "Tapirs", "Monkeys", "Tropical birds", "Giant catfish"],
    highlights: ["Opened 1992 — $15M landmark project", "90+ animal species", "Multi-level walkways and bridges"],
  },
  {
    id: "aquarium", name: "Scott Aquarium", icon: "🦈", cat: "indoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-2.jpg",
    tagline: "70-Foot Shark Tunnel",
    desc: "Walk through a 70-foot acrylic tunnel surrounded by sharks, rays, and sea turtles. Coral reef displays, jellyfish galleries, and touch tanks bring the ocean to the Great Plains.",
    animals: ["Sand tiger sharks", "Sea turtles", "Jellyfish", "Rays", "Clownfish", "Penguins"],
    highlights: ["70-foot walk-through shark tunnel", "Coral reef and jellyfish exhibits", "Interactive touch tanks"],
  },
  {
    id: "african-grasslands", name: "African Grasslands", icon: "🦁", cat: "outdoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-3.jpg",
    tagline: "$73M — Zoo's Largest Exhibit",
    desc: "A sprawling 28-acre panoramic experience featuring African wildlife in naturalistic habitats. The largest single project in the zoo's history at $73 million.",
    animals: ["Lions", "Giraffes", "African elephants", "Cheetahs", "Zebras", "African wild dogs"],
    highlights: ["28 acres — zoo's largest exhibit", "$73M investment", "Panoramic savanna views"],
  },
  {
    id: "asian-highlands", name: "Asian Highlands", icon: "🐆", cat: "outdoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-1.jpg",
    tagline: "USA Today Best Zoo Exhibit 2024",
    desc: "Eight immersive acres from Northern Indian grasslands to Himalayan peaks. Named USA Today's Best Zoo Exhibit in 2024. Themed Yeti Camp concessions add to the adventure.",
    animals: ["Snow leopards", "Red pandas", "Amur tigers", "Sloth bears", "Sichuan takin"],
    highlights: ["8 acres of immersive habitat", "USA Today Best Zoo Exhibit 2024", "Yeti Camp themed dining"],
  },
  {
    id: "orangutan", name: "Hubbard Orangutan Forest", icon: "🦧", cat: "outdoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-2.jpg",
    tagline: "Reopened 2024 After Major Renovation",
    desc: "Recently renovated with integrated technology throughout, this exhibit provides orangutans with enhanced climbing structures and enrichment. Ruby, a 26-year-old Bornean orangutan, is expecting an infant in early 2026.",
    animals: ["Bornean orangutans", "White-cheeked gibbons"],
    highlights: ["Reopened June 2024 after 2-year renovation", "Integrated technology enrichment", "Ruby expecting infant — early 2026"],
  },
  {
    id: "gorilla", name: "Hubbard Gorilla Valley", icon: "🦍", cat: "outdoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-3.jpg",
    tagline: "Updated African Jungle Theme",
    desc: "Reopened August 2024 with a refreshed African jungle theme, elevator access, and enhanced educational elements. Watch western lowland gorillas in naturalistic social groups.",
    animals: ["Western lowland gorillas"],
    highlights: ["Reopened August 2024", "Elevator access for accessibility", "Educational enhancements"],
  },
  {
    id: "sea-lion", name: "Owen Sea Lion Shores", icon: "🦭", cat: "outdoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-1.jpg",
    tagline: "$27.5M Coastal Experience",
    desc: "A 1-acre coastal habitat with a 275,000-gallon saltwater pool featuring natural wave chambers, shallow beaches, and an underwater viewing cavern. The grand sea arch is the largest single rock piece in the zoo.",
    animals: ["California sea lions", "Harbour seals"],
    highlights: ["275,000-gallon saltwater pool", "Underwater viewing cavern", "Natural wave chambers", "170+ shaded seats"],
  },
  {
    id: "butterfly", name: "Butterfly & Insect Pavilion", icon: "🦋", cat: "indoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-2.jpg",
    tagline: "Walk Among Free-Flying Butterflies",
    desc: "A 14,000 sq ft pavilion featuring a 2,450 sq ft glass conservatory where hundreds of butterflies fly freely around you. Insect exhibits showcase the incredible diversity of arthropods.",
    animals: ["Hundreds of butterfly species", "Exotic insects", "Tarantulas", "Beetles"],
    highlights: ["Free-flying butterfly conservatory", "14,000 sq ft facility", "Not stroller-friendly (carry babies)"],
    note: "Not stroller-friendly — baby carriers recommended",
  },
  {
    id: "madagascar", name: "Expedition Madagascar", icon: "🐒", cat: "indoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-3.jpg",
    tagline: "Island of Unique Wildlife",
    desc: "Explore Madagascar's unique biodiversity with lemurs, giant jumping rats, and straw-coloured fruit bats. Linked to the zoo's active conservation projects on the island.",
    animals: ["Ring-tailed lemurs", "Giant jumping rats", "Fruit bats", "Chameleons"],
    highlights: ["Active conservation projects", "Unique island species", "Indoor tropical environment"],
  },
  {
    id: "adventure-trails", name: "Children's Adventure Trails", icon: "🧒", cat: "interactive",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-1.jpg",
    tagline: "5 Acres of Hands-On Discovery",
    desc: "Five acres of interactive outdoor play and learning. The Treehouse Hub features a 3-level structure with shipwreck slide, climbing net, and bridge. Animal Ambassador demonstrations on the Big Backyard stage.",
    animals: ["Animal Ambassadors (demo animals)", "Farm animals"],
    highlights: ["3-level Treehouse Hub", "Shipwreck slide & climbing net", "The Pond, Stream & Great Meadow", "Animal Ambassador demonstrations"],
  },
  {
    id: "aviary", name: "Simmons Aviary", icon: "🦅", cat: "outdoor",
    img: "/images/content/venues/henry-doorly-zoo/henry-doorly-zoo-2.jpg",
    tagline: "Walk-Through Bird Experience",
    desc: "A walk-through aviary housing birds from around the world in naturalistic habitats. Adjacent to Asian Highlands on the main path.",
    animals: ["Eagles", "Cranes", "Tropical birds", "Waterfowl"],
    highlights: ["Walk-through free-flight environment", "Adjacent to Asian Highlands"],
  },
];

export const EXHIBIT_CATS = [
  { id: "all", label: "All Exhibits", icon: "🗺️" },
  { id: "indoor", label: "Indoor", icon: "🏛️" },
  { id: "outdoor", label: "Outdoor", icon: "🌿" },
  { id: "interactive", label: "Interactive", icon: "🤲" },
];

/* ── Rides & Attractions ── */
export const ZOO_RIDES = [
  { id: "skyfari", name: "Skyfari Aerial Tram", icon: "🚡", price: "$7 roundtrip", hours: "10:30 AM – 4 PM", desc: "Soar above the zoo from Butterfly Pavilion to the lion platform. Spectacular aerial views of exhibits and the Omaha skyline.", note: "Under 12 must have adult · Weather dependent (50°F+ required)", open: true },
  { id: "carousel", name: "Sue's Carousel", icon: "🎠", price: "$4/person", hours: "10:30 AM – 4 PM", desc: "30 beautifully crafted wildlife-themed animals. A classic zoo experience for all ages.", note: "42\" minimum height unaccompanied", open: true },
  { id: "train", name: "Zoo Railroad", icon: "🚂", price: "$3.50 one-way · $7 roundtrip", hours: "Seasonal", desc: "2.5-mile scenic railway connecting Omaha Depot to African Lodge through the heart of the zoo.", note: "Currently closed for season — weather dependent", open: false },
  { id: "tram", name: "Zoo Tram", icon: "🚌", price: "$1.25/stop · $5 roundtrip", hours: "10:30 AM – 4 PM", desc: "Hop-on, hop-off tram service connecting major zoo areas. Great for saving energy between distant exhibits.", open: true },
  { id: "vr", name: "Wild Explorer VR", icon: "🥽", price: "$8 ($6 members)", hours: "10 AM – 4 PM", desc: "360-degree virtual reality adventures — swim with sharks, trek with gorillas, witness African migrations, or walk among dinosaurs.", note: "$15 for 2-rider combo", open: true },
];

/* ── IMAX Theater ── */
export const ZOO_IMAX = {
  name: "Lozier Giant Screen Theater",
  desc: "One of the region's premier giant-screen experiences. The screen stands as tall as 4 giraffes and as wide as 7 rhinos, powered by a Christie digital 4K 3D projector and 12,000-watt QSC 5.1 surround sound.",
  pricing: { member: "FREE", nonMember: "$7" },
  hours: "10 AM – 4 PM daily",
  note: "Seating closes 5 min after showtime · Tickets at box office or (402) 330-4629",
  specs: ["4-story screen", "Christie 4K 3D projector", "12,000-watt QSC 5.1 surround", "Stadium seating"],
  films: [
    { title: "Oceans: Our Blue Planet", desc: "Dive into the planet's last great wilderness — from tropical coral reefs to the deepest, darkest ocean depths.", icon: "🌊" },
    { title: "Elephants: Giants of the Desert", desc: "Follow a family of desert elephants across the Namib Desert in a breathtaking story of survival.", icon: "🐘" },
    { title: "Dinosaurs of Antarctica", desc: "Journey to the frozen continent to discover fossils that reveal a prehistoric world of giant creatures.", icon: "🦕" },
  ],
};

/* ── Events & Seasonal Programs ── */
export const ZOO_EVENTS = [
  { id: "zoolightful", name: "Zoolightful", when: "Nov – Jan (select nights)", time: "6 – 9:30 PM", icon: "✨", desc: "800+ lanterns, dazzling lights, character meet-and-greets, Santa visits, and carousel rides. Igloo reservations available (seats up to 8).", tag: "Holiday" },
  { id: "boo", name: "Howl-O-Ween Safari", when: "October (select weekends)", time: "5:30 – 8:30 PM", icon: "🎃", desc: "Family-friendly Halloween adventure with trick-or-treating, costume contests, and spooky-themed animal encounters throughout the zoo.", tag: "Halloween" },
  { id: "roar", name: "Roar & Pour", when: "Summer (select evenings)", time: "6 – 9 PM", icon: "🍷", desc: "Adults-only evening at the zoo with craft beer, wine tastings, live music, and after-hours animal encounters. 21+ event.", tag: "Adults Only" },
  { id: "late-nights", name: "Late Nights at the Zoo", when: "Fall (select nights)", time: "6 – 9 PM", icon: "🌙", desc: "Extended evening hours with special programming, food vendors, and unique animal viewing experiences as the zoo comes alive after dark.", tag: "Evening" },
  { id: "noonyear", name: "Noon Year's Eve", when: "December 31", time: "10 AM – 1 PM", icon: "🎉", desc: "Ring in the new year at noon! Perfect for families with young children who can't stay up until midnight. Countdown, confetti, and celebration.", tag: "Family" },
  { id: "camps", name: "Summer Zoo Camps", when: "June – July", time: "Various sessions", icon: "⛺", desc: "Week-long day camps for ages 4–14 with behind-the-scenes animal encounters, STEM activities, and outdoor adventures.", tag: "Education" },
];

/* ── Dining (13 locations) ── */
export const ZOO_DINING = [
  { name: "Durham TreeTops Restaurant", location: "Next to Lied Jungle", hours: "10 AM – 4 PM", icon: "🌳", desc: "Fresh salads, Omaha Steaks burgers, chicken tenders, sandwiches. Gluten-free and vegan options. Indoor seating overlooking Lied Jungle.", featured: true },
  { name: "Tusker Grill", location: "African Lodge", hours: "10 AM – 4 PM", icon: "🌍", desc: "Authentic African cuisine including peri peri chicken, plus standard fare. Themed to the African Grasslands.", featured: true },
  { name: "Sea Turtle Café", location: "Near Scott Aquarium", hours: "10 AM – 4 PM", icon: "🐢", desc: "Pizza, pasta, and ice cream near the aquarium.", featured: false },
  { name: "Omaha Steaks Grill", location: "Outside Lied Jungle", hours: "10:30 AM – 5 PM", icon: "🥩", desc: "Flame-grilled Omaha Steaks burgers and salads with covered outdoor seating.", featured: true },
  { name: "Yeti Camp", location: "Asian Highlands", hours: "10 AM – 4 PM", icon: "🏔️", desc: "Chinese-inspired dishes in the themed Yeti Camp area of Asian Highlands.", featured: false },
  { name: "Plaza Café", location: "Desert Dome Plaza", hours: "10 AM – 5 PM", icon: "☕", desc: "Handcrafted beverages and sandwiches at the Hawks Desert Dome Plaza.", featured: false },
  { name: "Glacier Bay Landing Grill", location: "Near splash park", hours: "10 AM – 4 PM", icon: "🧊", desc: "Seafood and burgers near the seasonal splash park area.", featured: false },
  { name: "Ranger Camp Snacks", location: "Adventure Trails area", hours: "10 AM – 3 PM (Fri–Sun)", icon: "🌭", desc: "Hot dogs and beer. Weekend-only near Children's Adventure Trails.", featured: false },
  { name: "Garden Snacks", location: "Garden of the Senses", hours: "11 AM – 3 PM", icon: "🥗", desc: "Quick salads and beverages in the sensory garden.", featured: false },
  { name: "Orangutan Oasis", location: "Orangutan Forest", hours: "10 AM – 3 PM", icon: "🧃", desc: "Specialty beverages with forest views near the orangutan habitat.", featured: false },
  { name: "Sweet Shop", location: "Various", hours: "10 AM – 4 PM", icon: "🍦", desc: "Desserts and specialty beverages at multiple locations.", featured: false },
  { name: "Dippin' Dots", location: "Two locations", hours: "11 AM – 3 PM", icon: "🍧", desc: "Flash-frozen ice cream treats at two locations throughout the zoo.", featured: false },
  { name: "Theater Concessions", location: "IMAX Theater", hours: "10 AM – 4 PM", icon: "🍿", desc: "Classic movie snacks — popcorn, candy, and drinks.", featured: false },
];

/* ── Visitor Tips ── */
export const ZOO_TIPS = [
  { icon: "🅿️", title: "Free Parking", text: "All parking is free, first-come first-serve. Arrive early on weekends. North entrance lots are less crowded than the main (south) entrance." },
  { icon: "📅", title: "Best Time to Visit", text: "September is the sweet spot — mid-60s to 70s°F, low humidity, fewer crowds. Weekday mornings (Tue–Thu) are the quietest times year-round." },
  { icon: "🍎", title: "Bring Your Own Food", text: "Outside food is allowed! Pack lunches and snacks to save on dining costs. Picnic areas are available throughout the grounds." },
  { icon: "👶", title: "Stroller Rentals", text: "Single stroller $10/day, double/wagon $14/day at Main Gift Shop. Arrive early — first-come, first-serve. Note: Butterfly Pavilion is not stroller-friendly." },
  { icon: "♿", title: "Accessibility", text: "Fully wheelchair accessible with paved pathways, accessible restrooms, and designated parking. Motorized scooter rentals $30/day at Main Gift Shop." },
  { icon: "🌡️", title: "Beat the Weather", text: "7 acres of indoor exhibits mean great experiences rain or shine. Visit outdoor exhibits in cool mornings, save indoor ones for hot afternoons." },
  { icon: "🎫", title: "Save with Membership", text: "Household membership ($205/yr) pays for itself in 3 visits. Includes free IMAX, 5% discounts, reciprocal admission at 50+ zoos." },
  { icon: "📸", title: "Photo Spots", text: "Don't miss the Desert Dome exterior, Lied Jungle suspension bridges, Sea Lion Shores underwater window, and the Skyfari aerial views." },
];
