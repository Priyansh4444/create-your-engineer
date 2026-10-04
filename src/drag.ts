import type { CategoryId } from "./domain";
import { makeGhost, moveGhost, returnGhost, snapGhost } from "./motion";

export type DragSource =
  | { kind: "person"; personId: string }
  | { kind: "seat"; categoryId: CategoryId };

type Options = {
  source: DragSource;
  element: HTMLElement;
  event: PointerEvent;
  /** Drop targets, re-read at each move because the board can reflow. */
  slots: () => HTMLElement[];
  onTarget: (slot: HTMLElement | null) => void;
  /** Call `snap` to settle the card into the slot; `arrive` runs once it lands. */
  onDrop: (slot: HTMLElement, snap: (arrive: () => void) => void) => void;
  /** Touch only: how long a finger must rest before the card lifts. 0 lifts on any movement. */
  holdMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
};

const startDistance = 6;

function center(rect: DOMRect): { x: number; y: number } {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Pointer-driven drag with a magnetic pull toward the nearest slot.
 * Mouse starts on any movement. Touch on the deck needs a short hold, so a swipe
 * still scrolls the list; once lifted, the page stops scrolling under the finger.
 * Returns true if the gesture became a drag (so the click after it can be ignored).
 */
export function beginDrag(options: Options): (() => boolean) {
  const { element, event } = options;
  const startX = event.clientX;
  const startY = event.clientY;
  const pointerId = event.pointerId;
  const touch = event.pointerType === "touch";
  const holdMs = options.holdMs ?? 0;
  let timer = 0;
  let dragging = false;
  let ghost: HTMLElement | undefined;
  let ghostRect: DOMRect | undefined;
  let home: DOMRect | undefined;
  let last = { x: startX, y: startY, scale: 1 };
  let target: HTMLElement | null = null;
  let frame = 0;
  let pending: PointerEvent | undefined;

  const begin = () => {
    dragging = true;
    home = element.getBoundingClientRect();
    const made = makeGhost(element);
    ghost = made.ghost;
    ghostRect = made.rect;
    try {
      element.setPointerCapture(pointerId);
    } catch {
      /* the pointer may already be gone */
    }
    document.documentElement.classList.add("dragging");
    if (touch) navigator.vibrate?.(8);
    options.onStart?.();
  };

  const hold = (e: TouchEvent) => {
    if (dragging && e.cancelable) e.preventDefault();
  };
  window.addEventListener("touchmove", hold, { passive: false });
  if (touch && holdMs > 0) {
    timer = window.setTimeout(() => {
      if (!dragging) {
        pending = undefined;
        begin();
        // Show the lifted card where the finger is, before it has moved.
        if (ghost && ghostRect) moveGhost(ghost, ghostRect, startX, startY, 1.04);
      }
    }, holdMs);
  }

  const nearest = (x: number, y: number) => {
    let best: HTMLElement | null = null;
    let bestDistance = Infinity;
    let bestCenter = { x: 0, y: 0 };
    let radius = 0;
    for (const slot of options.slots()) {
      const rect = slot.getBoundingClientRect();
      const c = center(rect);
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bestDistance) {
        best = slot;
        bestDistance = d;
        bestCenter = c;
        radius = Math.max(rect.width, rect.height) * 0.95;
      }
    }
    return { slot: bestDistance <= radius ? best : null, center: bestCenter, distance: bestDistance, radius };
  };

  const render = () => {
    frame = 0;
    const e = pending;
    if (!e || !ghost || !ghostRect) return;
    const found = nearest(e.clientX, e.clientY);
    let x = e.clientX;
    let y = e.clientY;
    let scale = 1.04;
    if (found.slot) {
      // Pull harder the closer the card gets, never fully off the pointer until release.
      const pull = Math.min(0.72, 1 - found.distance / found.radius + 0.18);
      x += (found.center.x - x) * pull;
      y += (found.center.y - y) * pull;
      const slotRect = found.slot.getBoundingClientRect();
      scale = 1 + (slotRect.width / ghostRect.width - 1) * pull;
    }
    last = { x, y, scale };
    moveGhost(ghost, ghostRect, x, y, scale);
    if (found.slot !== target) {
      target = found.slot;
      options.onTarget(target);
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    if (!dragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) < startDistance) return;
      if (touch && holdMs > 0) {
        // The finger moved before the hold finished: this is a scroll, not a drag.
        window.clearTimeout(timer);
        cleanup();
        return;
      }
      begin();
    }
    e.preventDefault();
    pending = e;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const cleanup = () => {
    window.clearTimeout(timer);
    window.removeEventListener("touchmove", hold);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    if (frame) cancelAnimationFrame(frame);
    document.documentElement.classList.remove("dragging");
    options.onTarget(null);
    options.onEnd?.();
  };

  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    if (dragging) {
      pending = e;
      render();
    }
    const slot = target;
    cleanup();
    if (!dragging || !ghost || !ghostRect) return;
    try {
      element.releasePointerCapture(pointerId);
    } catch {
      /* already released */
    }
    if (slot) {
      const g = ghost;
      const rect = ghostRect;
      options.onDrop(slot, (arrive) => snapGhost(g, rect, last, slot, arrive));
      return;
    }
    returnGhost(ghost, ghostRect, last, home);
  };

  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    cleanup();
    if (dragging && ghost && ghostRect) returnGhost(ghost, ghostRect, last, home);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);

  return () => dragging;
}
