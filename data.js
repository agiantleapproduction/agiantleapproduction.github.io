// ─────────────────────────────────────────────────────────────
//  Everything you'll edit lives in this file.
//  Add a project = add an object to PROJECTS. That's it.
//  status: "live" | "dev" | "school"   ·   upgrading: "what's being added" (optional)
// ─────────────────────────────────────────────────────────────

window.SITE = {
  name: "Edow Jiru",
  role: "Software Developer · Builder of small, delightful tools",
  resumeUrl: "#",            // link to your PDF resume
  github: "https://github.com/agiantleapproduction",
  email: "",                 // optional
};

window.PROJECTS = [
  {
    id: "bakpak",
    name: "BakPak",
    status: "live",
    tagline: "A backpack that lives on the edge of your Mac's screen.",
    description:
      "A native macOS app (Swift) that tucks into the screen edge. Drag files, clips, notes and snippets in; pull them out anywhere. Skins, OCR, a colour picker, screen recording, offline-verified licenses via Stripe + Cloudflare, notarized universal builds.",
    tech: ["Swift", "AppKit", "Stripe", "Cloudflare Pages", "Workers KV"],
    screenshots: ["assets/bakpak-logo.png", "assets/bakpak-pocket.png", "assets/bakpak-skins.png"],
    links: [{ label: "Visit bakpak.fun", url: "https://bakpak.fun" }],
    color: 0xffc26b,
  },
  {
    id: "ponder",
    name: "Ponder",
    status: "live",
    tagline: "A home for deep thinkers: rate ideas on their merit, map what you actually believe.",
    description:
      "A web app for humanity's biggest questions: consciousness, free will, the universe, meaning. Ratings (Logic, Insight, Explanatory Power) are kept separate from belief, so ideas get judged on merit, not agreement. Beliefs show up as constellations. Discussion happens in the Dialectic: tagged replies (support, counter, steelman, question), a bridging sort that surfaces comments valued across belief lines, live audio debates, and changed-my-mind badges. Row-level security on every table, counters kept by database triggers.",
    tech: ["React 19", "TypeScript", "Vite", "Tailwind", "Framer Motion", "Supabase", "Postgres", "LiveKit", "Vercel"],
    screenshots: [
      "assets/ponder-1-intro.jpg",
      "assets/ponder-2-two-measures.jpg",
      "assets/ponder-3-constellation.jpg",
      "assets/ponder-4-dialectic.jpg",
    ],
    upgrading: "live debate features",
    links: [{ label: "Visit ponderhall.com", url: "https://ponderhall.com" }],
    color: 0xb59bff,
  },
  {
    id: "now",
    name: "NOW",
    status: "live",
    tagline: "A meditation app for the now moment, on iPhone and Apple Watch.",
    description:
      "Two breath tones and a voice that calls out your thoughts help you step off the train of thought, in meditation and through your day. Native iOS with an Apple Watch app and widgets, themes, insights, NOW Pro subscriptions through StoreKit, and group meditation: a Cloudflare Worker with one Durable Object per group keeps everyone on one clock and relays the host's live voice, without storing names or data.",
    tech: ["Swift", "SwiftUI", "watchOS", "WidgetKit", "StoreKit", "Cloudflare Workers", "Durable Objects"],
    screenshots: [
      "assets/now-1-home.jpg",
      "assets/now-3-meditating.jpg",
      "assets/now-2-groups.jpg",
      "assets/now-4-themes.jpg",
      "assets/now-5-insights.jpg",
    ],
    links: [{ label: "Get it on the App Store", url: "https://apps.apple.com/us/app/now-meditation-guide/id6829681996" }],
    color: 0x7fd6ff,
  },
  {
    id: "connected",
    name: "ConnectEd",
    status: "school",
    tagline: "A campus platform where NDSU students and teachers connect.",
    description:
      "Built with three classmates for CSCI 313. Communities by department and major, group chats, a news and events feed, and profiles. My part: the dashboard and post feed, the communities page with search, wiring communities and group chats to Firebase, join logic and 'my communities', and profile settings for changing email and password.",
    tech: ["Angular 21", "TypeScript", "Firebase", "Firestore", "Bootstrap", "Angular SSR", "Team of 4"],
    screenshots: ["assets/connected-logo.png"],
    shotBg: "#ffffff",
    links: [{ label: "View on GitHub", url: "https://github.com/agiantleapproduction/ConnectED" }],
    color: 0x6fe3c8,
  },
  {
    id: "starlane",
    name: "Starlane",
    status: "dev",
    tagline: "Navigation through space, on real roads. Releasing soon on iPhone and CarPlay.",
    description:
      "Starlane turns your drive into a flight. Roads become glowing lanes, buildings become orbital stations and gas stations become Fuel Ports. Zoom out and cities become planets, states become stars, and the whole Earth becomes a spiral galaxy. Real turn-by-turn navigation with spoken directions, lane guidance and speed limits, a CarPlay app, a Live Activity, and a trip log measured in light-seconds. A 3D world engine renders OpenStreetMap vector tiles, and routes come from Valhalla through a Cloudflare Worker that only answers genuine devices (App Attest, signed requests, replay protection), so the app ships no API keys.",
    tech: ["Swift", "SwiftUI", "SceneKit", "CarPlay", "ActivityKit", "StoreKit", "OpenStreetMap", "Valhalla", "Cloudflare Workers", "App Attest"],
    screenshots: [
      "assets/starlane-logo.jpg",
      "assets/starlane-4-galaxy.jpg",
      "assets/starlane-1-street.jpg",
      "assets/starlane-2-guidance.jpg",
      "assets/starlane-3-state.jpg",
      "assets/starlane-5-roads.jpg",
      "assets/starlane-carplay.jpg",
    ],
    links: [], // add the App Store link at launch
    color: 0x7ff0ff,
  },
];

// The four "about me" stars. `sections` render as blocks in the panel.
window.ABOUT = [
  {
    id: "skills",
    name: "Skills",
    color: 0xc79bff,
    groups: [
      { title: "Languages", items: ["Swift", "TypeScript", "JavaScript", "SQL", "Python"] },
      { title: "Apple", items: ["SwiftUI", "AppKit", "watchOS", "WidgetKit", "StoreKit", "App Store releases", "Notarization"] },
      { title: "Web & backend", items: ["React", "Vite", "Tailwind", "Supabase / Postgres", "Cloudflare Workers & Pages", "Vercel", "LiveKit"] },
      { title: "Product", items: ["Stripe payments & licensing", "Subscriptions", "Marketing videos", "Figma"] },
    ],
  },
  {
    id: "career",
    name: "Career",
    color: 0xff8fa3,
    timeline: [
      { when: "2026 — now", what: "Independent developer, A Giant Leap", note: "Designed, built and shipped three products solo: BakPak (macOS), NOW (iOS + Apple Watch) and Ponder (web), from code to payments to launch videos." },
      { when: "YYYY — YYYY", what: "TODO: Role, Company", note: "TODO: one line of impact." },
    ],
  },
  {
    id: "school",
    name: "Education",
    color: 0x8ab4ff,
    timeline: [
      { when: "Class of 2028", what: "B.S. Physics & Computer Science, dual major · North Dakota State University", note: "Honors student · Dean's List. Built ConnectEd with classmates for CSCI 313." },
    ],
  },
  {
    id: "passions",
    name: "Passions",
    color: 0xffe08a,
    stories: [
      {
        title: "Why anything is happening",
        body: "For as long as I can remember I've been curious about existence and the nature of reality. I realized young that nobody really knows what life is, why any of us are here, or what we fundamentally are. That question never left me, and it pulled me toward the stars, cosmology and theoretical physics.",
      },
      {
        title: "Questions I carry around",
        items: [
          "Where is the universe?",
          "What is the essence of life?",
          "What happens inside a black hole?",
          "What are space and time?",
          "What does it actually mean for matter to move through space?",
        ],
      },
      {
        title: "Where I go on hard days",
        body: "When I'm down or going through something hard, I go back to these questions. Remembering how strange and unlikely it is that any of this exists makes me grateful, and it makes me resilient.",
      },
      {
        title: "Looking ahead",
        body: "I think a lot about where we're going: philosophy, the future of science, and humanity's climb up the Kardashev scale. It's why I study Physics and Computer Science together: one to understand the universe, the other to build things in it.",
      },
    ],
  },
];
