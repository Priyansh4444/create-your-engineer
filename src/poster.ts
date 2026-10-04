import {
  drawBackground,
  drawCover,
  fit,
  loadFonts,
  loadImage,
  MONO,
  roundRect,
  SANS,
  wrap,
  type Ctx,
} from "./canvas";
import { categories, readSeat, type Category, type Engineer, type Person } from "./domain";
import { arcs, metrics, seatLayout, type Point } from "./layout";
import { isIcon, markOf, markSrc } from "./marks";

const WIDTH = 1500;
const HEIGHT = 1560;
const STAGE = { x: 30, y: 110, w: 1440, h: 1400 };
/** The same proportions as a seat on the screen, scaled up. */
const CARD_W = Math.round(STAGE.w * 0.1667);
const CARD_H = Math.round(CARD_W * 1.4);

type Seat = { category: Category; person: Person };
type Art = { portrait?: HTMLImageElement; mark?: HTMLImageElement; icon: boolean };

function drawHeader(ctx: Ctx) {
  ctx.strokeStyle = "#ededed";
  ctx.fillStyle = "#ededed";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(66, 66, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(66, 66, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText("Create your engineer", 104, 66);
}

/** The orbit: a ring between neighbours, a spoke from every seat, and the core in the middle. */
function drawOrbit(ctx: Ctx, engineer: Engineer, at: (id: Category["id"]) => Point) {
  const m = metrics(false);
  const scale = STAGE.w / m.w;
  const centre = { x: STAGE.x + m.cx * scale, y: STAGE.y + m.cy * scale };
  const R = m.R * scale;
  const seatAngle = (index: number) => -Math.PI / 2 + (index / categories.length) * Math.PI * 2;

  const stroke = (lit: boolean, draw: () => void) => {
    ctx.strokeStyle = lit ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.16)";
    ctx.lineWidth = lit ? 2.8 : 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    draw();
    ctx.stroke();
  };
  stroke(false, () => ctx.arc(centre.x, centre.y, R, 0, Math.PI * 2));
  arcs.forEach(([a, b], index) => {
    const lit = Boolean(readSeat(engineer, a) && readSeat(engineer, b));
    if (lit) stroke(true, () => ctx.arc(centre.x, centre.y, R, seatAngle(index), seatAngle(index + 1)));
  });
  for (const category of categories) {
    const p = at(category.id);
    stroke(Boolean(readSeat(engineer, category.id)), () => {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(centre.x, centre.y);
    });
  }

  // The core: seven arcs around an orb. Every seat is taken in a poster, so every arc is lit.
  const r = STAGE.w * 0.05;
  const glow = ctx.createRadialGradient(centre.x, centre.y, r * 0.3, centre.x, centre.y, r * 3.4);
  glow.addColorStop(0, "rgba(255,255,255,0.32)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centre.x, centre.y, r * 3.4, 0, Math.PI * 2);
  ctx.fill();
  drawArcs(ctx, centre, r * 1.45, (index) => Boolean(readSeat(engineer, categories[index].id)));
  const orb = ctx.createRadialGradient(centre.x - r * 0.25, centre.y - r * 0.3, 0, centre.x, centre.y, r);
  orb.addColorStop(0, "#ffffff");
  orb.addColorStop(1, "#bdbdbd");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(centre.x, centre.y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** The ring of seven arcs, as on the board. */
export function drawArcs(ctx: Ctx, c: Point, radius: number, lit: (index: number) => boolean) {
  const gap = (7 * Math.PI) / 180;
  const span = (Math.PI * 2) / categories.length;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(3, radius * 0.055);
  categories.forEach((_, index) => {
    const start = -Math.PI / 2 + index * span + gap / 2;
    ctx.strokeStyle = lit(index) ? "#fff" : "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius, start, start + span - gap);
    ctx.stroke();
  });
}

function drawCard(ctx: Ctx, seat: Seat, centre: Point, line: string | undefined, art: Art | undefined) {
  const x = centre.x - CARD_W / 2;
  const y = centre.y - CARD_H / 2;

  // The category name sits above the card.
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#cfcfcf";
  ctx.font = `400 19px ${MONO}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(seat.category.name.toUpperCase(), x + 2, y - 16);
  ctx.letterSpacing = "0px";

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, x, y, CARD_W, CARD_H, 18);
  ctx.fillStyle = "#0d0d0d";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, CARD_W, CARD_H, 18);
  ctx.clip();
  if (art?.portrait) drawCover(ctx, art.portrait, x, y, CARD_W, CARD_H);
  const top = ctx.createLinearGradient(0, y, 0, y + CARD_H * 0.3);
  top.addColorStop(0, "rgba(0,0,0,0.55)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(x, y, CARD_W, CARD_H);
  const bottom = ctx.createLinearGradient(0, y + CARD_H * 0.46, 0, y + CARD_H);
  bottom.addColorStop(0, "rgba(0,0,0,0)");
  bottom.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = bottom;
  ctx.fillRect(x, y, CARD_W, CARD_H);

  // The company mark, in the corner, on its own plate. An icon is square and can be larger.
  const mark = art?.mark;
  if (mark) {
    const aspect = mark.naturalWidth && mark.naturalHeight ? mark.naturalWidth / mark.naturalHeight : 1;
    const h = art?.icon ? 32 : 22;
    const w = Math.min(h * aspect, CARD_W * 0.5);
    const lh = w / aspect;
    const pad = art?.icon ? 9 : 10;
    const px = x + CARD_W - 12 - w - pad * 2;
    roundRect(ctx, px, y + 12, w + pad * 2, h + pad * 2, 11);
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fill();
    ctx.drawImage(mark, px + pad, y + 12 + pad + (h - lh) / 2, w, lh);
  }

  // Text stacks upward from the bottom edge: the line (if any), then the name.
  const bottomBaseline = y + CARD_H - 20;
  let nameBaseline = bottomBaseline;
  if (line) {
    ctx.font = `400 20px ${SANS}`;
    ctx.fillStyle = "#f2f2f2";
    const rows = wrap(ctx, line, CARD_W - 36, 3);
    const first = bottomBaseline - (rows.length - 1) * 25;
    rows.forEach((text, i) => ctx.fillText(text, x + 18, first + i * 25));
    nameBaseline = first - 32;
  }
  ctx.fillStyle = "#fff";
  ctx.font = `600 24px ${SANS}`;
  ctx.fillText(fit(ctx, seat.person.name, CARD_W - 36), x + 18, nameBaseline);
  ctx.restore();

  roundRect(ctx, x + 1, y + 1, CARD_W - 2, CARD_H - 2, 17);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

export async function loadArt(seated: Seat[]): Promise<Map<string, Art>> {
  return new Map(
    await Promise.all(
      seated.map(async ({ person }) => {
        const id = markOf(person);
        const art: Art = {
          portrait: await loadImage(person.portrait),
          mark: id ? await loadImage(markSrc(id)) : undefined,
          icon: id ? isIcon(id) : false,
        };
        return [person.id, art] as const;
      }),
    ),
  );
}

export function seatsOf(engineer: Engineer): Seat[] {
  return categories.flatMap((category) => {
    const person = readSeat(engineer, category.id);
    return person ? [{ category, person }] : [];
  });
}

/** Draws the filled engineer to a canvas, so the saved image never depends on DOM cloning. */
export async function renderPoster(engineer: Engineer): Promise<HTMLCanvasElement> {
  await loadFonts();
  const seated = seatsOf(engineer);
  const art = await loadArt(seated);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  const layout = seatLayout(false);
  const at = (id: Category["id"]): Point => ({
    x: STAGE.x + (layout[id].x / 100) * STAGE.w,
    y: STAGE.y + (layout[id].y / 100) * STAGE.h,
  });

  drawBackground(ctx, WIDTH, HEIGHT);
  drawHeader(ctx);
  drawOrbit(ctx, engineer, at);
  for (const seat of seated) {
    drawCard(ctx, seat, at(seat.category.id), engineer.lines[seat.category.id]?.trim(), art.get(seat.person.id));
  }
  return canvas;
}

export function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image."))), "image/png"),
  );
}

export async function posterBlob(engineer: Engineer): Promise<Blob> {
  return toBlob(await renderPoster(engineer));
}

export async function savePoster(engineer: Engineer): Promise<void> {
  const url = URL.createObjectURL(await posterBlob(engineer));
  const link = document.createElement("a");
  link.href = url;
  link.download = "your-engineer.png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
