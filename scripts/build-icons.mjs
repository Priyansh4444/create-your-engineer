#!/usr/bin/env node
/**
 * Builds the compact marks in public/icons/ (the smallest form of each logo) and the list
 * of which ids have one. Run: node scripts/build-icons.mjs
 *
 * An icon is the real logo file from svgl.app where that is the better one, otherwise a
 * simple-icons glyph in the brand colour, otherwise an existing symbol-only file in
 * public/logos/. Anything left over falls back to its lockup.
 */
import * as si from "simple-icons";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

/** mark id -> simple-icons name (without the "si" prefix) */
const simple = {
  google: "Google", anthropic: "Anthropic", twitch: "Twitch", netflix: "Netflix", vercel: "Vercel", bun: "Bun",
  dropbox: "Dropbox", convex: "Convex", cloudflare: "Cloudflare", youtube: "Youtube", sst: "Sst", neon: "Neon",
  databricks: "Databricks", expo: "Expo", spacex: "Spacex", ycombinator: "Ycombinator", meta: "Meta", cursor: "Cursor",
  paypal: "Paypal", tesla: "Tesla", x: "X", baidu: "Baidu", basecamp: "Basecamp", stripe: "Stripe", shopify: "Shopify",
  figma: "Figma", replit: "Replit", nvidia: "Nvidia", deno: "Deno", netlify: "Netlify", planetscale: "Planetscale",
  remix: "Remix", tanstack: "Tanstack", uber: "Uber", airbnb: "Airbnb", linear: "Linear",
  redis: "Redis", sentry: "Sentry", guardian: "Theguardian", apple: "Apple", brave: "Brave", mozilla: "Mozilla",
  perplexity: "Perplexity", temporal: "Temporal", vite: "Vite", vitest: "Vitest", svelte: "Svelte",
  typescript: "Typescript", neovim: "Neovim", nodejs: "Nodedotjs", django: "Django", flask: "Flask", ghostty: "Ghostty",
  terraform: "Terraform", trpc: "Trpc", react: "React", nextjs: "Nextdotjs", solid: "Solid", effect: "Effect", opencode: "Opencode",
  epicgames: "Epicgames", hashicorp: "Hashicorp", github: "Github", bluesky: "Bluesky", resend: "Resend", tldraw: "Tldraw", helium: "Helium", cobalt: "Cobalt",
};

/**
 * mark id -> svgl.app title. These are the logos' own files, used as published, so they keep
 * their real colours. It covers what simple-icons lacks, and it wins where a brand's real logo
 * has more than one colour (Google, Convex, Figma) which a single-colour icon would flatten.
 */
const svgl = {
  google: "Google", convex: "Convex", figma: "Figma", dropbox: "Dropbox", paypal: "PayPal", neovim: "Neovim",
  nodejs: "Node.js", ghostty: "Ghostty", mozilla: "Firefox", trpc: "tRPC", redis: "Redis",
  cloudflare: "Cloudflare", django: "Django", youtube: "YouTube", meta: "Meta",
  microsoft: "Microsoft", openai: "OpenAI", amazon: "Amazon", sourcegraph: "Sourcegraph", twitter: "Twitter",
  eventbrite: "Eventbrite", vue: "Vue", openclaw: "OpenClaw", oxc: "Oxc", rolldown: "Rolldown", xai: "xAI",
  coinbase: "Coinbase", cluely: "Cluely", anduril: "Anduril", joyent: "Joyent", libgdx: "libGDX",
};

/** Files in public/logos that are already a symbol on their own. */
const existing = ["t3", "nytimes", "earendil", "million", "voidzero", "mit"];

/** Dark brand colours vanish on black, so they become the page's off-white. */
function ink(hex) {
  const n = Number.parseInt(hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 72 ? "#ededed" : `#${hex}`;
}

await mkdir("public/icons", { recursive: true });
const made = [];

for (const [id, name] of Object.entries(simple)) {
  const icon = si[`si${name}`];
  if (!icon) { console.log("no simple-icon", id); continue; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${icon.title}"><path fill="${ink(icon.hex)}" d="${icon.path}"/></svg>\n`;
  await writeFile(`public/icons/${id}.svg`, svg);
  made.push(id);
}

const list = await (await fetch("https://api.svgl.app")).json();
const byTitle = new Map(list.map((entry) => [entry.title.toLowerCase(), entry]));
for (const [id, title] of Object.entries(svgl)) {
  const entry = byTitle.get(title.toLowerCase());
  if (!entry) { console.log("no svgl entry", id); continue; }
  let route = entry.route;
  if (typeof route === "object") route = route.dark ?? route.light;
  const res = await fetch(route);
  if (!res.ok) { console.log("svgl fetch failed", id); continue; }
  await writeFile(`public/icons/${id}.svg`, await res.text());
  if (!made.includes(id)) made.push(id);
}

/**
 * Logos published as a file on the company's own site. Dark ink becomes the page's off-white so
 * it reads on black; colours stay as published.
 */
const published = {
  discoveryloop: { url: "https://www.discoveryloop.com/assets/favicon.svg" },
  crunchlabs: { url: "https://www.crunchlabs.com/cdn/shop/files/CL_Logo_Single_Line_1.svg", dir: "logos", ink: ["#00416c"] },
};
for (const [id, { url, dir = "icons", ink: dark = [] }] of Object.entries(published)) {
  const res = await fetch(url);
  if (!res.ok) { console.log("published fetch failed", id); continue; }
  let svg = await res.text();
  for (const color of dark) svg = svg.replaceAll(new RegExp(color, "gi"), "#ededed");
  await writeFile(`public/${dir}/${id}.svg`, svg);
  if (dir === "icons") made.push(id);
}

/** Logos that a site draws inline in its page, taken as drawn. `currentColor` becomes off-white. */
const inline = {
  angellist: { url: "https://www.angellist.com", index: 0, dir: "logos" },
  block: { url: "https://block.xyz", index: 2 },
  imput: { url: "https://imput.net", index: 0 },
};
for (const [id, { url, index, dir = "icons" }] of Object.entries(inline)) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  const found = (await res.text()).match(/<svg\b[\s\S]*?<\/svg>/g)?.[index];
  if (!found) { console.log("inline svg not found", id); continue; }
  const svg = found
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/currentColor/g, "#ededed")
    .replace(/width="100%"\s+height="100%"/, "")
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  await writeFile(`public/${dir}/${id}.svg`, svg);
  if (dir === "icons") made.push(id);
}

/**
 * A few brands publish only a raster logo. It is wrapped in an SVG as it is, resized, never
 * redrawn, so the mark is still the real one. Needs ffmpeg.
 */
const raster = {
  pragmatic: { url: "https://www.pragmaticengineer.com/assets/logo_large.png", size: 128 },
  molly: { url: "https://mollyrocket.com/r/molly_logo_80ab5040d770d5c7.png", size: 160 },
};
for (const [id, { url, size }] of Object.entries(raster)) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) { console.log("raster fetch failed", id); continue; }
  await writeFile(`public/icons/${id}.src`, Buffer.from(await res.arrayBuffer()));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", `public/icons/${id}.src`, "-vf", `scale=${size}:${size}`, `public/icons/${id}.png`]);
  const png = await readFile(`public/icons/${id}.png`);
  await writeFile(
    `public/icons/${id}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><image width="${size}" height="${size}" href="data:image/png;base64,${png.toString("base64")}"/></svg>\n`,
  );
  await Promise.all([`public/icons/${id}.src`, `public/icons/${id}.png`].map((file) => import("node:fs/promises").then((fs) => fs.rm(file))));
  made.push(id);
}

for (const id of existing) {
  if (!existsSync(`public/logos/${id}.svg`)) continue;
  await copyFile(`public/logos/${id}.svg`, `public/icons/${id}.svg`);
  made.push(id);
}

made.sort();
await writeFile(
  "src/icons.generated.ts",
  `// Generated by scripts/build-icons.mjs. Do not edit.\nexport const iconIds: ReadonlySet<string> = new Set(${JSON.stringify(made)});\n`,
);
console.log(`${made.length} icons`);
