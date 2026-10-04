import { drawBackground, drawCover, fit, loadFonts, MONO, SANS, type Ctx } from "./canvas";
import { categories, readSeat, type Engineer } from "./domain";
import { arcs, type Point } from "./layout";
import { drawArcs, loadArt, seatsOf, toBlob } from "./poster";

/** The size X shows a large card at, 1.91:1. */
export const SHARE = { w: 1200, h: 630 } as const;

const ORBIT = { cx: 600, cy: 345, R: 215 };
const FACE = 46;

function drawTitle(ctx: Ctx) {
  ctx.strokeStyle = "#ededed";
  ctx.fillStyle = "#ededed";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(60, 52, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(60, 52, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `500 24px ${SANS}`;
  ctx.fillText("Create your engineer", 88, 52);
}

/**
 * The card X shows when a result is shared. Made to be read small: seven portraits on the same
 * orbit as the board, each with its category and name, around the core.
 */
export async function renderShare(engineer: Engineer): Promise<HTMLCanvasElement> {
  await loadFonts();
  const seated = seatsOf(engineer);
  const art = await loadArt(seated);

  const canvas = document.createElement("canvas");
  canvas.width = SHARE.w;
  canvas.height = SHARE.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  drawBackground(ctx, SHARE.w, SHARE.h, { x: 240, y: 200, r: 560 });
  drawTitle(ctx);

  // Seat positions: the same circle as the board, fitted to this card.
  const angle = (index: number) => -Math.PI / 2 + (index / categories.length) * Math.PI * 2;
  const seatPoint = (index: number): Point => ({
    x: ORBIT.cx + ORBIT.R * Math.cos(angle(index)),
    y: ORBIT.cy + ORBIT.R * Math.sin(angle(index)),
  });
  const at = (id: (typeof categories)[number]["id"]): Point =>
    seatPoint(categories.findIndex((c) => c.id === id));
  const centre = { x: ORBIT.cx, y: ORBIT.cy };

  // Circle and spokes.
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(centre.x, centre.y, ORBIT.R, 0, Math.PI * 2);
  ctx.stroke();
  arcs.forEach(([a, b], index) => {
    if (!(readSeat(engineer, a) && readSeat(engineer, b))) return;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(centre.x, centre.y, ORBIT.R, angle(index), angle(index + 1));
    ctx.stroke();
  });
  for (const category of categories) {
    const p = at(category.id);
    ctx.strokeStyle = readSeat(engineer, category.id) ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = readSeat(engineer, category.id) ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(centre.x, centre.y);
    ctx.stroke();
  }

  // Core.
  const r = 38;
  const glow = ctx.createRadialGradient(centre.x, centre.y, r * 0.3, centre.x, centre.y, r * 4);
  glow.addColorStop(0, "rgba(255,255,255,0.3)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centre.x, centre.y, r * 4, 0, Math.PI * 2);
  ctx.fill();
  drawArcs(ctx, centre, r * 1.5, (index) => Boolean(readSeat(engineer, categories[index].id)));
  const orb = ctx.createRadialGradient(centre.x - r * 0.25, centre.y - r * 0.3, 0, centre.x, centre.y, r);
  orb.addColorStop(0, "#fff");
  orb.addColorStop(1, "#bdbdbd");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(centre.x, centre.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Portraits, each with its category above and its name below.
  for (const seat of seated) {
    const p = at(seat.category.id);
    const a = art.get(seat.person.id);

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(p.x, p.y, FACE + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, FACE, 0, Math.PI * 2);
    ctx.clip();
    if (a?.portrait) drawCover(ctx, a.portrait, p.x - FACE, p.y - FACE, FACE * 2, FACE * 2, 0.15);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, FACE + 2, 0, Math.PI * 2);
    ctx.stroke();

    if (a?.mark) {
      const size = 26;
      const mx = p.x + FACE * 0.72;
      const my = p.y + FACE * 0.72;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(mx, my, size / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
      const aspect = a.mark.naturalWidth && a.mark.naturalHeight ? a.mark.naturalWidth / a.mark.naturalHeight : 1;
      const w = aspect >= 1 ? size : size * aspect;
      const h = aspect >= 1 ? size / aspect : size;
      ctx.drawImage(a.mark, mx - w / 2, my - h / 2, w, h);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#8a8a8a";
    ctx.font = `400 13px ${MONO}`;
    ctx.letterSpacing = "2.4px";
    ctx.fillText(seat.category.name.toUpperCase(), p.x + 1, p.y - FACE - 14);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = "#fff";
    ctx.font = `600 21px ${SANS}`;
    ctx.fillText(fit(ctx, seat.person.name, 190), p.x, p.y + FACE + 32);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#5c5c5c";
  ctx.font = `400 15px ${MONO}`;
  ctx.fillText(location.host, SHARE.w - 48, 58);
  return canvas;
}

export async function shareBlob(engineer: Engineer): Promise<Blob> {
  return toBlob(await renderShare(engineer));
}
