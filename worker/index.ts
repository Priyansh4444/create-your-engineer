import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import geistRegular from "./fonts/Geist-Regular.ttf";
import geistSemiBold from "./fonts/Geist-SemiBold.ttf";
import geistMono from "./fonts/GeistMono-Regular.ttf";
import { artPaths, OG, ogSvg, type Art, type OgArt } from "./og";
import { categories, parseEngineer, readSeat, type Engineer } from "../src/domain";

interface Env {
  ASSETS: Fetcher;
}

let ready: Promise<void> | undefined;
const startRenderer = () => (ready ??= initWasm(resvgWasm));

const mime: Record<string, string> = { webp: "image/webp", svg: "image/svg+xml", png: "image/png" };
const CARD_VERSION = 5;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** A file from the asset folder, as a data URI the rasteriser can read. Undefined if there is none. */
async function dataUri(env: Env, origin: string, path: string): Promise<string | undefined> {
  const response = await env.ASSETS.fetch(new Request(new URL(path, origin)));
  if (!response.ok) return undefined;
  const type = response.headers.get("content-type")?.split(";")[0] ?? mime[path.split(".").pop() ?? ""];
  if (!type?.startsWith("image/")) return undefined;
  return `data:${type};base64,${toBase64(new Uint8Array(await response.arrayBuffer()))}`;
}

async function gatherArt(env: Env, origin: string, engineer: Engineer): Promise<OgArt> {
  const paths = artPaths(engineer);
  const seats = new Map<string, Art>();
  await Promise.all(
    paths.seats.map(async (seat) => {
      const [portrait, icon] = await Promise.all([
        dataUri(env, origin, seat.portrait),
        dataUri(env, origin, seat.mark),
      ]);
      seats.set(seat.id, { portrait, mark: icon ?? (await dataUri(env, origin, seat.markFallback)) });
    }),
  );
  return { seats };
}

async function renderCard(env: Env, url: URL): Promise<Uint8Array> {
  await startRenderer();
  const engineer = parseEngineer(url.search);
  const svg = ogSvg(engineer, await gatherArt(env, url.origin, engineer), url.host);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG.w },
    font: {
      fontBuffers: [new Uint8Array(geistRegular), new Uint8Array(geistSemiBold), new Uint8Array(geistMono)],
      defaultFontFamily: "Geist",
      loadSystemFonts: false,
    },
  });
  const png = resvg.render().asPng();
  resvg.free();
  return png;
}

/** The same engineer always gives the same card, so the query is the cache key, minus noise. */
function cardKey(url: URL): Request {
  const engineer = parseEngineer(url.search);
  const seats = categories.map((c) => readSeat(engineer, c.id)?.id ?? "").join(",");
  return new Request(`${url.origin}/og.png?v=${CARD_VERSION}&c=${seats}`);
}

async function ogImage(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const key = cardKey(url);
  const cache = caches.default;
  const cached = await cache.match(key);
  if (cached) return cached;
  try {
    const response = new Response(await renderCard(env, url), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
    ctx.waitUntil(cache.put(key, response.clone()));
    return response;
  } catch (error) {
    return new Response(`Could not draw the card: ${String(error)}`, { status: 500 });
  }
}

/** The app is one static page. Each link to it gets that page with tags naming its own card. */
async function page(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const response = await env.ASSETS.fetch(request);
  if (!response.headers.get("content-type")?.includes("text/html")) return response;

  const engineer = parseEngineer(url.search);
  const names = [...new Set(categories.flatMap((c) => readSeat(engineer, c.id)?.name ?? []))];
  const any = names.length > 0;
  const title = any ? "My engineer" : "Create your engineer";
  const description = any
    ? `Built from ${names.join(", ")}.`
    : "Drag seven people onto seven seats to make one engineer. Humor, taste, judgment, care, nerve, clarity, tempo.";
  const seats = url.searchParams.get("c");
  const image = `${url.origin}/og.png?v=${CARD_VERSION}${seats ? `&c=${encodeURIComponent(seats).replace(/%3A/g, ":").replace(/%2C/g, ",")}` : ""}`;
  const tags: [string, string, string][] = [
    ["property", "og:type", "website"],
    ["property", "og:site_name", "Create your engineer"],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", url.href],
    ["property", "og:image", image],
    ["property", "og:image:type", "image/png"],
    ["property", "og:image:width", String(OG.w)],
    ["property", "og:image:height", String(OG.h)],
    ["property", "og:image:alt", `${title}. ${description}`],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", image],
  ];
  const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

  return new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(title);
      },
    })
    .on("head", {
      element(el) {
        el.append(tags.map(([attr, name, content]) => `<meta ${attr}="${name}" content="${escape(content)}">`).join("\n"), { html: true });
      },
    })
    .transform(response);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/og.png") return ogImage(request, env, ctx);
    if (url.pathname === "/" && request.method === "GET") return page(request, env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
