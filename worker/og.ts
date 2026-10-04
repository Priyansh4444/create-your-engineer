import { categories, readSeat, type Engineer } from "../src/domain";
import { markOf } from "../src/marks";

/** The size X, Slack, Discord and iMessage show a large link card at: 1.91 to 1. */
export const OG = { w: 1200, h: 630 } as const;

/** Marks that are always on the card, whatever was chosen. */
const SIGNATURE = ["helium", "imput"] as const;
const SIGNATURE_TEXT = "imput.net";

const CIRCLE = { cx: 838, cy: 322, R: 206, face: 44 };

export type Art = { portrait?: string; mark?: string };
export type OgArt = { seats: Map<string, Art>; signature: (string | undefined)[] };

/** What the card needs from the asset folder: which files, as paths. */
export function artPaths(engineer: Engineer) {
  const seats = categories.flatMap((category) => {
    const person = readSeat(engineer, category.id);
    if (!person) return [];
    const mark = markOf(person);
    return [{ id: person.id, portrait: `/faces/${person.id}.jpg`, mark: `/icons/${mark}.svg`, markFallback: `/logos/${mark}.svg` }];
  });
  return { seats, signature: SIGNATURE.map((id) => `/icons/${id}.svg`) };
}

function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Geist's average glyph is about half an em wide, close enough to break lines without measuring. */
function wrap(text: string, size: number, width: number, maxLines: number): string[] {
  const per = size * 0.52;
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    const next = current ? `${current} ${word}` : word;
    if (next.length * per <= width || !current) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s.,;:]+$/, "")}…`;
  return kept;
}

function clip(text: string, size: number, width: number): string {
  const max = Math.floor(width / (size * 0.54));
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

const seatAngle = (index: number) => -Math.PI / 2 + (index / categories.length) * Math.PI * 2;
const seatPoint = (index: number) => ({
  x: CIRCLE.cx + CIRCLE.R * Math.cos(seatAngle(index)),
  y: CIRCLE.cy + CIRCLE.R * Math.sin(seatAngle(index)),
});

function arcPath(radius: number, from: number, to: number): string {
  const p = (a: number) => `${(CIRCLE.cx + radius * Math.cos(a)).toFixed(2)} ${(CIRCLE.cy + radius * Math.sin(a)).toFixed(2)}`;
  return `M${p(from)} A${radius} ${radius} 0 ${to - from > Math.PI ? 1 : 0} 1 ${p(to)}`;
}

/** The card, as an SVG string. Fonts are looked up by family name, so the rasteriser must load Geist. */
export function ogSvg(engineer: Engineer, art: OgArt): string {
  const filled = categories.map((category) => readSeat(engineer, category.id));
  const count = filled.filter(Boolean).length;
  const names = [...new Set(filled.flatMap((person) => person?.name ?? []))];
  const complete = count === categories.length;

  const out: string[] = [];
  const add = (markup: string) => out.push(markup);

  add(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${OG.w}" height="${OG.h}" viewBox="0 0 ${OG.w} ${OG.h}">`);
  add(`<defs>
    <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.8" fill="#fff"/><circle cx="4.5" cy="4.5" r="0.8" fill="#fff"/></pattern>
    <radialGradient id="light" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 150) scale(760)">
      <stop offset="0" stop-color="#fff"/><stop offset="0.38" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="lightMask"><rect width="${OG.w}" height="${OG.h}" fill="url(#light)"/></mask>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="${(0.14 + 0.26 * (count / 7)).toFixed(2)}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="orb" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#b9b9b9"/></radialGradient>
    <clipPath id="clipFace"><circle cx="0" cy="0" r="${CIRCLE.face}"/></clipPath>
  </defs>`);

  // Ground, the stippled light, and a soft halo behind the circle.
  add(`<rect width="${OG.w}" height="${OG.h}" fill="#050505"/>`);
  add(`<rect width="${OG.w}" height="${OG.h}" fill="url(#dots)" mask="url(#lightMask)" opacity="0.42"/>`);
  add(`<circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.R + 150}" fill="url(#halo)"/>`);
  add(`<rect x="0.5" y="0.5" width="${OG.w - 1}" height="${OG.h - 1}" fill="none" stroke="#fff" stroke-opacity="0.1"/>`);

  // The circle, the spokes, and the stretches that are lit.
  add(`<circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.R}" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="2"/>`);
  categories.forEach((_, index) => {
    const p = seatPoint(index);
    const lit = Boolean(filled[index]);
    add(`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${CIRCLE.cx}" y2="${CIRCLE.cy}" stroke="#fff" stroke-opacity="${lit ? 0.85 : 0.14}" stroke-width="${lit ? 2.6 : 2}" ${lit ? "" : 'stroke-dasharray="2 9" stroke-linecap="round"'}/>`);
    if (filled[index] && filled[(index + 1) % 7]) {
      add(`<path d="${arcPath(CIRCLE.R, seatAngle(index), seatAngle(index + 1))}" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="2.6" stroke-linecap="round"/>`);
    }
  });

  // The core: seven arcs around an orb that grows with the seats.
  const gap = (7 * Math.PI) / 180;
  const span = (Math.PI * 2) / 7;
  categories.forEach((_, index) => {
    const from = seatAngle(index) + gap / 2;
    add(`<path d="${arcPath(50, from, from + span - gap)}" fill="none" stroke="#fff" stroke-opacity="${filled[index] ? 1 : 0.2}" stroke-width="4" stroke-linecap="round"/>`);
  });
  add(`<circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${(10 + 24 * (count / 7)).toFixed(1)}" fill="url(#orb)"/>`);

  // Seats.
  categories.forEach((category, index) => {
    const p = seatPoint(index);
    const person = filled[index];
    const a = person ? art.seats.get(person.id) : undefined;
    add(`<text x="${p.x.toFixed(1)}" y="${(p.y - CIRCLE.face - 14).toFixed(1)}" text-anchor="middle" font-family="Geist Mono" font-size="13" letter-spacing="2.4" fill="#fff" fill-opacity="0.55">${esc(category.name.toUpperCase())}</text>`);
    if (!person) {
      add(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${CIRCLE.face}" fill="#0a0a0a" stroke="#fff" stroke-opacity="0.28" stroke-width="2" stroke-dasharray="5 7"/>`);
      return;
    }
    add(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${CIRCLE.face + 6}" fill="#050505"/>`);
    add(`<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})"><g clip-path="url(#clipFace)">${a?.portrait ? `<image x="${-CIRCLE.face}" y="${-CIRCLE.face}" width="${CIRCLE.face * 2}" height="${CIRCLE.face * 2}" preserveAspectRatio="xMidYMin slice" xlink:href="${a.portrait}"/>` : ""}</g></g>`);
    add(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${CIRCLE.face + 2}" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="2"/>`);
    if (a?.mark) {
      const mx = p.x + CIRCLE.face * 0.74;
      const my = p.y + CIRCLE.face * 0.74;
      add(`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="19" fill="#050505" stroke="#fff" stroke-opacity="0.25"/>`);
      add(`<image x="${(mx - 11).toFixed(1)}" y="${(my - 11).toFixed(1)}" width="22" height="22" preserveAspectRatio="xMidYMid meet" xlink:href="${a.mark}"/>`);
    }
    add(`<text x="${p.x.toFixed(1)}" y="${(p.y + CIRCLE.face + 32).toFixed(1)}" text-anchor="middle" font-family="Geist" font-weight="600" font-size="19" fill="#fff">${esc(clip(person.name, 19, 204))}</text>`);
  });

  // Left column: the brand, the headline, and the line under it.
  add(`<circle cx="76" cy="72" r="13" fill="none" stroke="#ededed" stroke-width="2.4"/><circle cx="76" cy="72" r="4" fill="#ededed"/>`);
  add(`<text x="102" y="80" font-family="Geist" font-weight="500" font-size="25" fill="#ededed">Create your engineer</text>`);

  const headline = count > 0 ? ["My engineer"] : ["Create your", "engineer"];
  headline.forEach((line, i) => {
    add(`<text x="64" y="${230 + i * 84}" font-family="Geist" font-weight="600" font-size="78" letter-spacing="-2.4" fill="#fff">${esc(line)}</text>`);
  });
  const top = 230 + (headline.length - 1) * 84 + 52;
  const sub = count > 0
    ? `${complete ? "Built from" : `${count} of 7 so far:`} ${names.join(", ")}`
    : "Drag seven people onto seven seats. Humor, taste, judgment, care, nerve, clarity, tempo.";
  wrap(sub, 26, 470, count > 0 ? 4 : 3).forEach((line, i) => {
    add(`<text x="64" y="${top + i * 36}" font-family="Geist" font-size="26" fill="#a8a8a8">${esc(line)}</text>`);
  });

  // The signature: always on the card.
  const footY = 560;
  let x = 64;
  art.signature.forEach((uri) => {
    if (!uri) return;
    add(`<rect x="${x}" y="${footY - 8}" width="42" height="42" rx="11" fill="#fff" fill-opacity="0.07" stroke="#fff" stroke-opacity="0.14"/>`);
    add(`<image x="${x + 7}" y="${footY - 1}" width="28" height="28" preserveAspectRatio="xMidYMid meet" xlink:href="${uri}"/>`);
    x += 52;
  });
  add(`<text x="${x + 6}" y="${footY + 20}" font-family="Geist Mono" font-size="20" letter-spacing="0.4" fill="#fff" fill-opacity="0.7">${esc(SIGNATURE_TEXT)}</text>`);

  add(`</svg>`);
  return out.join("\n");
}
