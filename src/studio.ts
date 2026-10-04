import { createEffect, createMemo, createSignal } from "solid-js";
import {
  categories,
  clearSeat,
  markLabel,
  emptyEngineer,
  fillEmptySeats,
  filledCount,
  firstEmptySeat,
  getPerson,
  isCategoryId,
  parseEngineer,
  people,
  readSeat,
  serializeEngineer,
  setSeat,
  swapSeats,
  type CategoryId,
  type Engineer,
  type Focus,
  type Person,
} from "./domain";
import { beginDrag, type DragSource } from "./drag";
import { flyCard, playArrive } from "./motion";
import { posterBlob, savePoster } from "./poster";
import { shareBlob } from "./share";

/**
 * Everything the screen knows and every way it can change, in one place.
 * Components read signals and call actions; the rules themselves live in domain.ts.
 */
export function createStudio() {
  const [engineer, setEngineer] = createSignal<Engineer>(parseEngineer(window.location.search));
  const [focus, setFocus] = createSignal<Focus>({ kind: "idle" });
  const [live, setLive] = createSignal("");
  const [query, setQuery] = createSignal("");
  const [magnet, setMagnet] = createSignal<CategoryId | null>(null);
  const [lifted, setLifted] = createSignal<{ person?: string; seat?: CategoryId }>({});
  const [busy, setBusy] = createSignal<"" | "saving" | "copying" | "sharing">("");
  const [note, setNote] = createSignal("");

  let stage: HTMLElement | undefined;
  let returnFocus: HTMLElement | undefined;
  let suppressClick = false;

  const count = createMemo(() => filledCount(engineer()));
  const complete = () => count() === categories.length;

  const focusedCategory = createMemo(() => {
    const current = focus();
    return current.kind === "category" ? categories.find((c) => c.id === current.categoryId) : undefined;
  });
  const focusedPerson = createMemo(() => {
    const current = focus();
    return current.kind === "person" ? getPerson(current.personId) : undefined;
  });

  // The order the deck is shown in. It starts editorial and changes only when shuffled.
  const [order, setOrder] = createSignal<readonly Person[]>(people);

  const visible = createMemo(() => {
    const needle = query().trim().toLowerCase();
    if (!needle) return order();
    return order().filter((person) => {
      const marks = [...person.companies, ...person.projects].map(markLabel).join(" ");
      return `${person.name} ${person.handle} ${person.role} ${marks}`.toLowerCase().includes(needle);
    });
  });

  // The share link follows the engineer.
  createEffect(() => {
    const search = serializeEngineer(engineer());
    const next = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) history.replaceState(null, "", next);
  });

  /* ---------- the board's elements ---------- */

  const slotElements = () => [...(stage?.querySelectorAll<HTMLElement>(".slot") ?? [])];
  const slotElement = (id: CategoryId) => stage?.querySelector<HTMLElement>(`.slot[data-category="${id}"]`) ?? null;
  const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;
  const categoryOf = (slot: HTMLElement | null): CategoryId | null => {
    const id = slot?.dataset.category;
    return id && isCategoryId(id) ? id : null;
  };

  /** Runs after Solid has painted the new seat, so the landing plays on the real card. */
  function afterSeatChange(changed: readonly CategoryId[]) {
    requestAnimationFrame(() => {
      for (const id of changed) {
        const slot = slotElement(id);
        if (slot) playArrive(slot);
      }
    });
  }

  /* ---------- focus ---------- */

  function idle() {
    if (focus().kind === "idle") return;
    const back = returnFocus;
    setFocus({ kind: "idle" });
    queueMicrotask(() => back && document.contains(back) && back.focus());
  }

  /** Opening what is already open closes it. */
  function toggleFocus(next: Focus, source: HTMLElement) {
    const current = focus();
    returnFocus = source;
    const same =
      (current.kind === "category" && next.kind === "category" && current.categoryId === next.categoryId) ||
      (current.kind === "person" && next.kind === "person" && current.personId === next.personId);
    setFocus(same ? { kind: "idle" } : next);
  }

  const openCategory = (categoryId: CategoryId, source: HTMLElement) =>
    toggleFocus({ kind: "category", categoryId }, source);
  const openPerson = (personId: string, source: HTMLElement) => toggleFocus({ kind: "person", personId }, source);

  /* ---------- changing the engineer ---------- */

  function commit(categoryId: CategoryId, personId: string) {
    const before = engineer();
    const next = setSeat(before, categoryId, personId);
    const person = getPerson(personId);
    if (next === before || !person) return;
    setEngineer(next);
    setLive(`${categoryName(categoryId)}, ${person.name}.`);
    afterSeatChange([categoryId]);
  }

  function moveSeat(from: CategoryId, to: CategoryId) {
    const before = engineer();
    const next = swapSeats(before, from, to);
    if (next === before) return;
    setEngineer(next);
    setLive(
      [from, to]
        .map((id) => {
          const person = readSeat(next, id);
          return person ? `${categoryName(id)}, ${person.name}.` : `${categoryName(id)} cleared.`;
        })
        .join(" "),
    );
    afterSeatChange([from, to]);
  }

  /** A click or Enter on a card: into the open seat, or the next empty one. */
  function take(person: Person, from: HTMLElement) {
    const target = focusedCategory()?.id ?? firstEmptySeat(engineer());
    if (!target) {
      setLive("All seven seats are filled. Open a seat to change it.");
      return;
    }
    const slot = slotElement(target);
    if (slot) flyCard(from, slot, () => commit(target, person.id));
    else commit(target, person.id);
  }

  /** A new random order for the people, so the options are not always the same ones first. */
  function shuffle() {
    const next = [...order()];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setLive("Shuffled.");
  }

  function clear(categoryId: CategoryId) {
    const next = clearSeat(engineer(), categoryId);
    if (next === engineer()) return;
    setEngineer(next);
    setLive(`${categoryName(categoryId)} cleared.`);
  }

  function fillFrom(personId: string) {
    const person = getPerson(personId);
    const before = engineer();
    const next = fillEmptySeats(before, personId);
    if (!person || next === before) return;
    setEngineer(next);
    const filled = categories.filter((c) => before.seats[c.id] === undefined).map((c) => c.id);
    setLive(filled.map((id) => `${categoryName(id)}, ${person.name}.`).join(" "));
    afterSeatChange(filled);
  }

  function reset() {
    setEngineer(emptyEngineer);
    setFocus({ kind: "idle" });
    setLive("Cleared.");
  }

  /** Runs a button's work, shows what it is doing, and says so if it fails. */
  async function work(kind: "saving" | "copying" | "sharing", job: () => Promise<string | void>, failure: string) {
    if (!complete() || busy()) return;
    setBusy(kind);
    try {
      const done = await job();
      if (done) {
        setNote(done);
        setLive(done);
        setTimeout(() => setNote(""), 1800);
      }
    } catch {
      setLive(failure);
    } finally {
      setBusy("");
    }
  }

  const save = () => work("saving", () => savePoster(engineer()), "Could not save the image.");

  /** The image on the clipboard, ready to paste anywhere. */
  const copy = () =>
    work(
      "copying",
      async () => {
        // The blob is a promise, so the browser keeps the click's permission while it is drawn.
        await navigator.clipboard.write([new ClipboardItem({ "image/png": posterBlob(engineer()) })]);
        return "Image copied.";
      },
      "Could not copy the image.",
    );

  /**
   * Share on X with the picture on the card. The page uploads a card-sized image and gets back a
   * link whose preview X unfurls; if there is nowhere to upload, it shares the plain link.
   */
  const share = () => {
    // Opened now, in the click, so a popup blocker lets it through; pointed at X once the card is ready.
    const win = window.open("about:blank", "_blank");
    let opened = false;
    return work(
      "sharing",
      async () => {
        const names = categories.flatMap((c) => readSeat(engineer(), c.id)?.name ?? []);
        const text = `I built an engineer from seven people: ${[...new Set(names)].join(", ")}.`;
        let link = window.location.href;
        try {
          const response = await fetch(`/api/share?${serializeEngineer(engineer())}`, {
            method: "POST",
            headers: { "content-type": "image/png" },
            body: await shareBlob(engineer()),
          });
          if (response.ok) link = ((await response.json()) as { url: string }).url;
        } catch {
          /* share the plain link */
        }
        const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        opened = true;
        if (win) win.location.href = intent;
        else window.location.href = intent;
      },
      "Could not open X.",
    ).finally(() => {
      if (!opened) win?.close();
    });
  };

  /* ---------- dragging ---------- */

  /** Wraps a click so the click that ends a drag is ignored. */
  const unlessDragged = (handler: () => void) => () => {
    if (!suppressClick) handler();
  };

  /** Lift a card from the deck, or a filled seat, and drop it on a seat. */
  function lift(event: PointerEvent, source: DragSource) {
    if (event.button !== 0 || !(event.currentTarget instanceof HTMLElement)) return;
    if (source.kind === "seat" && !readSeat(engineer(), source.categoryId)) return;
    const card = event.currentTarget.closest<HTMLElement>(".card");
    if (!card) return;
    const dragged = beginDrag({
      source,
      element: card,
      event,
      holdMs: source.kind === "person" ? 200 : 0,
      slots: slotElements,
      onStart: () => setLifted(source.kind === "person" ? { person: source.personId } : { seat: source.categoryId }),
      onEnd: () => setLifted({}),
      onTarget: (slot) => {
        const id = categoryOf(slot);
        setMagnet(id && !(source.kind === "seat" && id === source.categoryId) ? id : null);
      },
      onDrop: (slot, snap) => {
        const id = categoryOf(slot);
        if (!id) return;
        snap(() => (source.kind === "person" ? commit(id, source.personId) : moveSeat(source.categoryId, id)));
      },
    });
    window.addEventListener(
      "pointerup",
      () => {
        if (!dragged()) return;
        suppressClick = true;
        setTimeout(() => (suppressClick = false), 60);
      },
      { once: true },
    );
  }

  return {
    // state
    engineer,
    focus,
    live,
    query,
    setQuery,
    magnet,
    lifted,
    busy,
    note,
    count,
    complete,
    focusedCategory,
    focusedPerson,
    visible,
    // the board registers its stage so effects know where to play
    registerStage: (element: HTMLElement) => (stage = element),
    setEngineer,
    // actions
    idle,
    openCategory,
    openPerson,
    take,
    clear,
    shuffle,
    fillFrom,
    reset,
    save,
    copy,
    share,
    lift,
    unlessDragged,
  };
}

export type Studio = ReturnType<typeof createStudio>;
