import { animate, createTimeline } from "animejs";

export function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type From = { x: number; y: number; scale: number };

function centerOf(rect: DOMRect): { x: number; y: number } {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/* ---------- the card in the air ---------- */

/**
 * A drag ghost is a fixed clone parked at the origin. Only its transform moves,
 * so dragging never touches layout.
 */
export function makeGhost(source: HTMLElement): { ghost: HTMLElement; rect: DOMRect } {
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  ghost.classList.add("ghost");
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
  document.body.appendChild(ghost);
  return { ghost, rect };
}

export function moveGhost(ghost: HTMLElement, rect: DOMRect, cx: number, cy: number, scale = 1): void {
  ghost.style.transform = `translate3d(${cx - rect.width / 2}px, ${cy - rect.height / 2}px, 0) scale(${scale})`;
}

/** Fly the ghost from where it is to the middle of `to`, then run `done`. */
function fly(
  ghost: HTMLElement,
  ghostRect: DOMRect,
  from: From,
  to: DOMRect,
  options: { scale: number; fade: boolean; duration: number; ease: string },
  done: () => void,
): void {
  const target = centerOf(to);
  ghost.style.transform = "none";
  animate(ghost, {
    x: [from.x - ghostRect.width / 2, target.x - ghostRect.width / 2],
    y: [from.y - ghostRect.height / 2, target.y - ghostRect.height / 2],
    scale: [from.scale, options.scale],
    opacity: options.fade ? [1, 0] : [1, 1],
    duration: options.duration,
    ease: options.ease,
    onComplete: () => {
      ghost.remove();
      done();
    },
  });
}

/** Magnetic snap: the card settles into the seat, then the seat is committed. */
export function snapGhost(ghost: HTMLElement, ghostRect: DOMRect, from: From, slot: HTMLElement, arrive: () => void): void {
  if (reduced()) {
    ghost.remove();
    arrive();
    return;
  }
  const end = slot.getBoundingClientRect();
  fly(ghost, ghostRect, from, end, { scale: end.width / ghostRect.width, fade: false, duration: 340, ease: "outCubic" }, arrive);
}

/** A click takes the same path as a drop: the card flies to its seat, then lands. */
export function flyCard(from: HTMLElement, slot: HTMLElement, arrive: () => void): void {
  const { ghost, rect } = makeGhost(from);
  const c = centerOf(rect);
  snapGhost(ghost, rect, { x: c.x, y: c.y, scale: 1 }, slot, arrive);
}

/** Nothing under the pointer: the card drifts home and fades. */
export function returnGhost(ghost: HTMLElement, ghostRect: DOMRect, from: From, home: DOMRect | undefined): void {
  if (reduced() || !home) {
    ghost.remove();
    return;
  }
  fly(ghost, ghostRect, from, home, { scale: 1, fade: true, duration: 280, ease: "outCubic" }, () => undefined);
}

/* ---------- a seat filling ---------- */

/**
 * A card landing: it settles, and the category name rises from the middle of the seat to the
 * line above the card. Everything else that moves on the board is SVG, in the stylesheet.
 */
export function playArrive(slot: HTMLElement): void {
  if (reduced()) return;
  const card = slot.querySelector<HTMLElement>(".card");
  if (!card) return;
  const caption = slot.querySelector<HTMLElement>(".caption");
  const timeline = createTimeline({ defaults: { ease: "outCubic" } });
  timeline.add(card, { scale: [0.92, 1], duration: 380 }, 0);
  if (caption) {
    // It starts over the middle of the card, where the empty seat kept its name.
    const rise = card.offsetHeight / 2 + caption.offsetHeight;
    timeline.add(caption, { y: [rise, 0], opacity: [0, 1], duration: 600, ease: "outExpo" }, 100);
  }
}
