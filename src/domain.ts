import { roster } from "./roster";

export const categories = [
  { id: "humor", name: "Humor", asks: "How lightly they hold the work" },
  { id: "taste", name: "Taste", asks: "What they refuse even when it works" },
  { id: "judgment", name: "Judgment", asks: "Where scarce attention goes" },
  { id: "care", name: "Care", asks: "What they will not leave behind" },
  { id: "nerve", name: "Nerve", asks: "What they will bet before it is proven" },
  { id: "clarity", name: "Clarity", asks: "How a tangled thing is made to speak" },
  { id: "tempo", name: "Tempo", asks: "The rhythm they keep when it gets loud" },
] as const;

export type Category = (typeof categories)[number];
export type CategoryId = Category["id"];

export const companyLabels = {
  google: "Google",
  anthropic: "Anthropic",
  twitch: "Twitch",
  t3: "T3",
  netflix: "Netflix",
  epic: "Epic",
  sourcegraph: "Sourcegraph",
  bootdev: "Boot.dev",
  vercel: "Vercel",
  bun: "Bun",
  bump: "Bump",
  dropbox: "Dropbox",
  convex: "Convex",
  a16z: "a16z",
  partykit: "PartyKit",
  cloudflare: "Cloudflare",
  youtube: "YouTube",
  anomaly: "Anomaly",
  sst: "SST",
  neon: "Neon",
  databricks: "Databricks",
  expo: "Expo",
  spacex: "SpaceX",
  ycombinator: "Y Combinator",
  meta: "Meta",
  cursor: "Cursor",
  microsoft: "Microsoft",
  openai: "OpenAI",
  paypal: "PayPal",
  tesla: "Tesla",
  x: "X",
  xai: "xAI",
  baidu: "Baidu",
  amazon: "Amazon",
  basecamp: "Basecamp",
  stripe: "Stripe",
  shopify: "Shopify",
  figma: "Figma",
  replit: "Replit",
  nvidia: "NVIDIA",
  keen: "Keen",
  anduril: "Anduril",
  indie: "Independent",
  aihero: "AI Hero",
  joyent: "Joyent",
  deno: "Deno",
  libgdx: "libGDX",
  cluely: "Cluely",
  id: "id",
  molly: "Molly Rocket",
  netlify: "Netlify",
  planetscale: "PlanetScale",
  eureka: "Eureka Labs",
  earendil: "Earendil",
  million: "Million Software",
  guardian: "The Guardian",
  nytimes: "The New York Times",
  meteor: "Meteor",
  voidzero: "VoidZero",
  hashicorp: "HashiCorp",
  superlogical: "Superlogical",
  sentry: "Sentry",
  nozzle: "Nozzle",
  tanstack: "TanStack",
  tldraw: "tldraw",
  remix: "Remix",
  eventbrite: "Eventbrite",
  lanyrd: "Lanyrd",
  temporal: "Temporal",
  airbyte: "Airbyte",
  aiengineer: "AI Engineer",
  pspdfkit: "PSPDFKit",
  skyscanner: "Skyscanner",
  uber: "Uber",
  pragmatic: "The Pragmatic Engineer",
  compose: "Compose",
  airbnb: "Airbnb",
  coinbase: "Coinbase",
  linear: "Linear",
  redis: "Redis",
  mit: "MIT",
  thinkingmachines: "Thinking Machines",
  ssi: "Safe Superintelligence",
  scale: "Scale AI",
  perplexity: "Perplexity",
  twitter: "Twitter",
  block: "Block",
  netscape: "Netscape",
  mozilla: "Mozilla",
  brave: "Brave",
  angellist: "AngelList",
  nasa: "NASA",
  apple: "Apple",
  crunchlabs: "CrunchLabs",
  khanacademy: "Khan Academy",
  imput: "imput",
  discoveryloop: "Discovery Loop",
  deepmind: "DeepMind",
  epicgames: "Epic Games",
} as const;

/** What a person works on: the projects and products, not the employer. */
export const projectLabels = {
  vue: "Vue",
  vite: "Vite",
  vitest: "Vitest",
  rolldown: "Rolldown",
  oxc: "Oxc",
  opencode: "OpenCode",
  effect: "Effect",
  svelte: "Svelte",
  ghostty: "Ghostty",
  terraform: "Terraform",
  flask: "Flask",
  django: "Django",
  nodejs: "Node.js",
  neovim: "Neovim",
  terminal: "terminal.shop",
  react: "React",
  nextjs: "Next.js",
  typescript: "TypeScript",
  solid: "Solid",
  openclaw: "OpenClaw",
  helium: "Helium",
  cobalt: "Cobalt",
} as const;

export type CompanyId = keyof typeof companyLabels;
export type ProjectId = keyof typeof projectLabels;
/** Anything with a mark: a company or a project. */
export type MarkId = CompanyId | ProjectId;

export function markLabel(id: MarkId): string {
  return id in companyLabels ? companyLabels[id as CompanyId] : projectLabels[id as ProjectId];
}

/** Companies are chronological. The last one is the current public affiliation. */
export type Person = {
  id: string;
  name: string;
  handle: string;
  xUrl: `https://x.com/${string}`;
  role: string;
  companies: readonly CompanyId[];
  /** What they work on. Not chronological. */
  projects: readonly ProjectId[];
  portrait: string;
};

/** Absent key = empty seat. Never store null. */
export type Composition = Partial<Record<CategoryId, string>>;

/** The visitor's own words for a seat. A line exists only while its seat is filled. */
export type Lines = Partial<Record<CategoryId, string>>;

export type Engineer = { seats: Composition; lines: Lines };

export type Focus =
  | { kind: "idle" }
  | { kind: "category"; categoryId: CategoryId }
  | { kind: "person"; personId: string };

export const emptyEngineer: Engineer = { seats: {}, lines: {} };

export const maxLineLength = 80;

const categoryIds = new Set<string>(categories.map((category) => category.id));

export function isCategoryId(value: string): value is CategoryId {
  return categoryIds.has(value);
}

export const people: readonly Person[] = roster.map((entry) => ({
  id: entry.id,
  name: entry.name,
  handle: entry.handle,
  xUrl: `https://x.com/${entry.handle}`,
  role: entry.role,
  companies: entry.companies,
  projects: entry.projects,
  portrait: `/faces/${entry.id}.webp`,
}));

const peopleById = new Map(people.map((person) => [person.id, person]));

export function getPerson(id: string): Person | undefined {
  return peopleById.get(id);
}

export function readSeat(engineer: Engineer, categoryId: CategoryId): Person | undefined {
  const personId = engineer.seats[categoryId];
  return personId ? getPerson(personId) : undefined;
}

export function filledCount(engineer: Engineer): number {
  return categories.filter((category) => readSeat(engineer, category.id)).length;
}

export function firstEmptySeat(engineer: Engineer): CategoryId | undefined {
  return categories.find((category) => !readSeat(engineer, category.id))?.id;
}

export function setSeat(engineer: Engineer, categoryId: CategoryId, personId: string): Engineer {
  if (!getPerson(personId) || engineer.seats[categoryId] === personId) return engineer;
  return { ...engineer, seats: { ...engineer.seats, [categoryId]: personId } };
}

export function clearSeat(engineer: Engineer, categoryId: CategoryId): Engineer {
  if (engineer.seats[categoryId] === undefined) return engineer;
  const seats = { ...engineer.seats };
  const lines = { ...engineer.lines };
  delete seats[categoryId];
  delete lines[categoryId];
  return { seats, lines };
}

export function cleanLine(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, maxLineLength);
}

/** Only a filled seat can carry a line. An empty line removes it. */
export function writeLine(engineer: Engineer, categoryId: CategoryId, text: string): Engineer {
  if (engineer.seats[categoryId] === undefined) return engineer;
  const line = text.replace(/\s+/g, " ").slice(0, maxLineLength);
  if (cleanLine(line) === "") {
    if (engineer.lines[categoryId] === undefined) return engineer;
    const lines = { ...engineer.lines };
    delete lines[categoryId];
    return { ...engineer, lines };
  }
  if (engineer.lines[categoryId] === line) return engineer;
  return { ...engineer, lines: { ...engineer.lines, [categoryId]: line } };
}

/** Move a seat, with its line, onto another. Seats swap when both are filled. */
export function swapSeats(engineer: Engineer, from: CategoryId, to: CategoryId): Engineer {
  if (from === to) return engineer;
  const seats: Composition = { ...engineer.seats };
  const lines: Lines = { ...engineer.lines };
  for (const bag of [seats, lines] as const) {
    const a = bag[from];
    const b = bag[to];
    if (b === undefined) delete bag[from];
    else bag[from] = b;
    if (a === undefined) delete bag[to];
    else bag[to] = a;
  }
  if (seats[from] === engineer.seats[from] && seats[to] === engineer.seats[to]) return engineer;
  return { seats, lines };
}

/** Fills only the empty seats. A seat already taken is never overwritten. */
export function fillEmptySeats(engineer: Engineer, personId: string): Engineer {
  if (!getPerson(personId)) return engineer;
  const seats: Composition = { ...engineer.seats };
  let changed = false;
  for (const category of categories) {
    if (seats[category.id] === undefined) {
      seats[category.id] = personId;
      changed = true;
    }
  }
  return changed ? { ...engineer, seats } : engineer;
}

/** `?c=humor:prime,taste:guillermo&l=humor~your words`. Unknown ids drop. */
export function parseEngineer(search: string): Engineer {
  const params = new URLSearchParams(search);
  const seats: Composition = {};
  for (const part of (params.get("c") ?? "").split(",")) {
    const separator = part.indexOf(":");
    if (separator <= 0) continue;
    const categoryId = part.slice(0, separator).trim();
    const personId = part.slice(separator + 1).trim();
    if (!isCategoryId(categoryId) || !getPerson(personId)) continue;
    seats[categoryId] = personId;
  }
  let engineer: Engineer = { seats, lines: {} };
  for (const part of params.getAll("l")) {
    const separator = part.indexOf("~");
    if (separator <= 0) continue;
    const categoryId = part.slice(0, separator);
    if (!isCategoryId(categoryId)) continue;
    engineer = writeLine(engineer, categoryId, part.slice(separator + 1));
  }
  return engineer;
}

export function serializeEngineer(engineer: Engineer): string {
  const parts: string[] = [];
  const seats = categories.flatMap((category) => {
    const person = readSeat(engineer, category.id);
    return person ? [`${category.id}:${person.id}`] : [];
  });
  if (seats.length > 0) parts.push(`c=${seats.join(",")}`);
  for (const category of categories) {
    const line = cleanLine(engineer.lines[category.id] ?? "");
    if (line && engineer.seats[category.id] !== undefined) {
      parts.push(`l=${encodeURIComponent(`${category.id}~${line}`)}`);
    }
  }
  return parts.join("&");
}
