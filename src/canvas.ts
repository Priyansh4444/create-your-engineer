/** Small drawing helpers shared by the poster, the share image, and the core. */

export const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif';
export const MONO = '"Geist Mono Variable", ui-monospace, monospace';

export type Ctx = CanvasRenderingContext2D;

const images = new Map<string, Promise<HTMLImageElement | undefined>>();

/** Loads once, then remembers. A failed load resolves to undefined rather than throwing. */
export function loadImage(src: string): Promise<HTMLImageElement | undefined> {
  let pending = images.get(src);
  if (!pending) {
    pending = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(undefined);
      image.src = src;
    });
    images.set(src, pending);
  }
  return pending;
}

export async function loadFonts(): Promise<void> {
  await Promise.all([
    document.fonts.load(`600 24px ${SANS}`),
    document.fonts.load(`400 20px ${SANS}`),
    document.fonts.load(`400 19px ${MONO}`),
  ]);
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Draws an image to fill a box, like `object-fit: cover`, biased toward the top where faces are. */
export function drawCover(ctx: Ctx, image: HTMLImageElement, x: number, y: number, w: number, h: number, bias = 0.2) {
  const scale = Math.max(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y - (dh - h) * bias, dw, dh);
}

export function wrap(ctx: Ctx, text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= width || !current) current = next;
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

export function fit(ctx: Ctx, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut}…`;
}

/** The board's light: a radial wash broken into a stipple. */
export function drawBackground(ctx: Ctx, width: number, height: number, light = { x: 320, y: 260, r: 760 }) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  for (let y = 0; y < height; y += 6) {
    for (let x = 0; x < width; x += 6) {
      for (const [ox, oy] of [[0, 0], [3, 3]] as const) {
        const d = Math.hypot(x + ox - light.x, y + oy - light.y) / light.r;
        if (d >= 1) continue;
        const alpha = 0.4 * (d < 0.35 ? 1 - d * 0.5 : (1 - d) * 0.85);
        if (alpha < 0.02) continue;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x + ox, y + oy, 1.4, 1.4);
      }
    }
  }
  ctx.globalAlpha = 1;
}
