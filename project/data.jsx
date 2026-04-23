// Sample data + helpers for Shortwave prototype

const SAMPLE_URLS = (() => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const items = [
    { slug: "launch-26",       target: "https://acme.co/product/launch/2026-spring?utm_source=email", clicks: 14382, created: now - 2*day,  health: "alive" },
    { slug: "g7k9x2",           target: "https://docs.internal.acme.co/handbook/engineering/onboarding",  clicks: 2194,  created: now - 5*day,  health: "alive" },
    { slug: "press-kit",        target: "https://storage.googleapis.com/acme-press/2026/media-kit.zip",    clicks: 892,   created: now - 9*day,  health: "alive" },
    { slug: "careers",          target: "https://acme.co/careers/engineering",                            clicks: 7102,  created: now - 12*day, health: "alive" },
    { slug: "w1nk2x",           target: "https://old.acme.io/legacy-api/v1/deprecated",                   clicks: 42,    created: now - 15*day, health: "down" },
    { slug: "q4-deck",          target: "https://drive.acme.co/files/2025-q4-board-deck.pdf",             clicks: 538,   created: now - 18*day, health: "alive" },
    { slug: "changelog",        target: "https://acme.co/changelog",                                      clicks: 19023, created: now - 21*day, health: "alive" },
    { slug: "support",          target: "https://help.acme.co",                                            clicks: 3410,  created: now - 24*day, health: "alive" },
    { slug: "m3t4r4",           target: "https://events.acme.co/devcon-2026",                             clicks: 4221,  created: now - 27*day, health: "alive" },
    { slug: "retro-jan",        target: "https://notion.acme.co/retro-january-2026",                      clicks: 88,    created: now - 31*day, health: "alive" },
    { slug: "blog-mesh",        target: "https://acme.co/blog/building-a-mesh-gateway",                   clicks: 6740,  created: now - 34*day, health: "alive" },
    { slug: "zj8k1m",           target: "https://staging.partner.co/invite?token=EXPIRED",                clicks: 12,    created: now - 38*day, health: "down" },
    { slug: "design-tokens",    target: "https://figma.com/file/XXXXX/design-tokens",                     clicks: 1203,  created: now - 40*day, health: "alive" },
    { slug: "yt-talk",           target: "https://www.youtube.com/watch?v=XXXXXX",                         clicks: 8842,  created: now - 44*day, health: "alive" },
    { slug: "invoice-apr",      target: "https://billing.acme.co/invoice/APR-2026-00421.pdf",              clicks: 3,     created: now - 48*day, health: "alive" },
    { slug: "x0y1z2",           target: "https://maps.acme.co/hq-directions",                             clicks: 221,   created: now - 52*day, health: "alive" },
    { slug: "status",           target: "https://status.acme.co",                                          clicks: 14921, created: now - 60*day, health: "alive" },
    { slug: "podcast-s2",       target: "https://pod.acme.co/season-2/episode-04",                        clicks: 1843,  created: now - 68*day, health: "alive" },
    { slug: "hq3p7a",           target: "https://legacy.acme.co/old-dashboard/v2",                        clicks: 67,    created: now - 74*day, health: "down" },
    { slug: "roadmap",          target: "https://acme.co/roadmap",                                        clicks: 5420,  created: now - 82*day, health: "alive" },
    { slug: "whitepaper-ai",    target: "https://acme.co/papers/ai-infrastructure-2026.pdf",              clicks: 3120,  created: now - 90*day, health: "alive" },
    { slug: "survey-q2",         target: "https://forms.acme.co/quarterly-customer-survey",                clicks: 412,   created: now - 98*day, health: "alive" },
  ];
  return items.map(it => ({
    ...it,
    id: it.slug,
    lastCheck: now - Math.floor(Math.random() * 20 * 60 * 1000),
  }));
})();

// Rich stats for the detail page (uses the first URL as the "selected" detailed example)
const DETAIL_STATS = {
  // click counts by day (last 30 days)
  series: [
    120, 98, 140, 210, 302, 280, 195, 310, 402, 388,
    420, 510, 498, 602, 540, 480, 612, 701, 690, 820,
    912, 840, 760, 680, 590, 720, 880, 1021, 1142, 980
  ],
  geo: [
    { code: "US", name: "United States",  count: 5842, x: 200, y: 170 },
    { code: "DE", name: "Germany",        count: 2310, x: 495, y: 150 },
    { code: "GB", name: "United Kingdom", count: 1942, x: 465, y: 135 },
    { code: "JP", name: "Japan",          count: 1402, x: 820, y: 175 },
    { code: "BR", name: "Brazil",         count: 980,  x: 310, y: 310 },
    { code: "IN", name: "India",          count: 780,  x: 700, y: 210 },
    { code: "FR", name: "France",         count: 540,  x: 478, y: 160 },
    { code: "AU", name: "Australia",      count: 402,  x: 850, y: 340 },
    { code: "CA", name: "Canada",         count: 186,  x: 210, y: 120 },
  ],
  browsers: [
    { name: "Chrome", value: 62 },
    { name: "Safari", value: 21 },
    { name: "Firefox", value: 9 },
    { name: "Edge", value: 5 },
    { name: "Other", value: 3 },
  ],
  devices: [
    { name: "Desktop", value: 54 },
    { name: "Mobile",  value: 38 },
    { name: "Tablet",  value: 8 },
  ],
  referrers: [
    { name: "direct", value: 38 },
    { name: "twitter.com", value: 18 },
    { name: "news.ycombinator.com", value: 14 },
    { name: "google.com", value: 12 },
    { name: "linkedin.com", value: 10 },
    { name: "reddit.com", value: 8 },
  ],
  // 30 days of uptime — 1 = up, 0 = down, 0.5 = partial
  uptime: [1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0.5,1,1,1,1,1,1],
};

window.SAMPLE_URLS = SAMPLE_URLS;
window.DETAIL_STATS = DETAIL_STATS;
