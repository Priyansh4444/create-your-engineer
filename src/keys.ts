import type { Studio } from "./studio";

/** Escape closes; arrows move between seats and between cards. Returns a way to stop listening. */
export function attachKeys(studio: Studio): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target;
    if (event.key === "Escape") {
      // In the filter, Escape clears the text before it closes anything.
      if (target instanceof HTMLInputElement && target.type === "search" && target.value) {
        studio.setQuery("");
        return;
      }
      if (studio.focus().kind === "idle") return;
      event.preventDefault();
      studio.idle();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!(target instanceof HTMLElement) || target instanceof HTMLInputElement) return;

    const vertical = event.key === "ArrowUp" || event.key === "ArrowDown";
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    if (!vertical && event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const group = target.closest<HTMLElement>(".stage, .grid");
    if (!group) return;
    const cards = [...group.querySelectorAll<HTMLElement>(".card-hit")];
    const index = cards.indexOf(target);
    if (index < 0) return;
    event.preventDefault();

    const step = forward ? 1 : -1;
    let next = cards[(index + step + cards.length) % cards.length];
    if (vertical && group.classList.contains("grid")) next = nearestInRow(cards, target, step) ?? target;
    next.focus();
    next.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}

/** In the grid, up and down move by row: the closest card above or below, in the same column. */
function nearestInRow(cards: HTMLElement[], from: HTMLElement, step: 1 | -1): HTMLElement | undefined {
  const here = from.getBoundingClientRect();
  const hx = here.left + here.width / 2;
  return cards
    .map((card) => ({ card, rect: card.getBoundingClientRect() }))
    .filter(({ rect }) => (step > 0 ? rect.top > here.top + 8 : rect.top < here.top - 8))
    .sort(
      (a, b) =>
        Math.abs(a.rect.top - here.top) - Math.abs(b.rect.top - here.top) ||
        Math.abs(a.rect.left + a.rect.width / 2 - hx) - Math.abs(b.rect.left + b.rect.width / 2 - hx),
    )[0]?.card;
}
