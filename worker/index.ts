import { categories, parseEngineer, readSeat } from "../src/domain";

interface Env {
  ASSETS: Fetcher;
  SHARES: KVNamespace;
}

/** What X unfurls: a 1200x630 card. Anything else is refused. */
const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 700_000;
const KEEP_SECONDS = 60 * 60 * 24 * 180;

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
}

/** Is this really a PNG of the size we asked for? Checked from its first bytes, not its name. */
function isShareCard(bytes: Uint8Array): boolean {
  if (bytes.length < 24 || PNG.some((b, i) => bytes[i] !== b)) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset);
  return view.getUint32(16) === WIDTH && view.getUint32(20) === HEIGHT;
}

/** POST /api/share?c=...&l=...  with the card as the body. Answers with the link to share. */
async function createShare(request: Request, env: Env, url: URL): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return json({ error: "Not from this site." }, 403);

  const engineer = parseEngineer(url.search);
  if (!categories.every((c) => readSeat(engineer, c.id))) return json({ error: "Fill all seven seats first." }, 400);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return json({ error: "Too large." }, 413);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > MAX_BYTES || !isShareCard(bytes)) return json({ error: "Not a share card." }, 400);

  const id = newId();
  await Promise.all([
    env.SHARES.put(`img:${id}`, bytes, { expirationTtl: KEEP_SECONDS }),
    env.SHARES.put(`search:${id}`, url.search, { expirationTtl: KEEP_SECONDS }),
  ]);
  return json({ id, url: `${url.origin}/s/${id}` });
}

/** GET /s/:id  A page that carries the card in its tags for X, and sends a person on to the result. */
async function sharePage(id: string, env: Env, url: URL): Promise<Response> {
  const search = await env.SHARES.get(`search:${id}`);
  if (search === null) return Response.redirect(`${url.origin}/`, 302);

  const engineer = parseEngineer(search);
  const names = categories.flatMap((c) => readSeat(engineer, c.id)?.name ?? []);
  const description = `Built from ${[...new Set(names)].join(", ")}.`;
  const title = "My engineer";
  const image = `${url.origin}/i/${id}.png`;
  const target = `/${search}`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(title)} · Create your engineer</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Create your engineer">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url.href)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:width" content="${WIDTH}">
<meta property="og:image:height" content="${HEIGHT}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
</head><body><script>location.replace(${JSON.stringify(target)})</script>
<a href="${escapeHtml(target)}">See the result</a></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

/** GET /i/:id.png  The card itself. It never changes, so it can be cached for good. */
async function shareImage(id: string, env: Env): Promise<Response> {
  const bytes = await env.SHARES.get(`img:${id}`, "arrayBuffer");
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(bytes, {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/share") {
      return request.method === "POST" ? createShare(request, env, url) : json({ error: "POST only." }, 405);
    }
    const page = url.pathname.match(/^\/s\/([\w-]{6,32})$/);
    if (page) return sharePage(page[1], env, url);
    const image = url.pathname.match(/^\/i\/([\w-]{6,32})\.png$/);
    if (image) return shareImage(image[1], env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
