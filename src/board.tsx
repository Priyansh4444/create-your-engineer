import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { Hole, SeatCard } from "./card";
import { Core } from "./core";
import { categories, readSeat } from "./domain";
import { arcPath, arcs, circlePath, metrics, seatLayout } from "./layout";
import type { Studio } from "./studio";

/** Wide boards use the wide orbit; a phone gets the taller one. */
const NARROW_BELOW = 560;

function startsNarrow(): boolean {
  const room = window.innerWidth >= 1000 ? window.innerWidth - 520 : window.innerWidth - 24;
  return room < NARROW_BELOW;
}

export function Board(props: { studio: Studio }) {
  const s = props.studio;
  const [narrow, setNarrow] = createSignal(startsNarrow());
  let board!: HTMLDivElement;

  onMount(() => {
    // The shape follows the room the board has, never the stage's own size, so it cannot flip back and forth.
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < NARROW_BELOW));
    observer.observe(board);
    onCleanup(() => observer.disconnect());
  });

  const layout = createMemo(() => seatLayout(narrow()));
  const m = () => metrics(narrow());
  const filled = (id: (typeof categories)[number]["id"]) => Boolean(readSeat(s.engineer(), id));
  const sx = (x: number) => (x / 100) * m().w;
  const sy = (y: number) => (y / 100) * m().h;

  return (
    <div class="board" ref={board} classList={{ complete: s.complete() }}>
      <div class="light" aria-hidden="true" />
      <div class="stage" ref={s.registerStage} data-layout={narrow() ? "narrow" : "wide"}>
        <svg class="orbit" viewBox={`0 0 ${m().w} ${m().h}`} aria-hidden="true">
          {/* The circle the seats sit on, and a spoke from every seat to the core. */}
          <path class="trace" d={circlePath(narrow())} />
          <For each={arcs}>
            {([a, b]) => (
              <path
                class="trace lit"
                classList={{ on: filled(a) && filled(b) }}
                pathLength="1"
                d={arcPath(layout()[a], layout()[b], narrow())}
              />
            )}
          </For>
          <For each={categories}>
            {(category) => {
              const d = () => `M${sx(layout()[category.id].x)} ${sy(layout()[category.id].y)} L${m().cx} ${m().cy}`;
              return (
                <>
                  <path class="trace spoke" d={d()} />
                  <path class="trace lit spoke" classList={{ on: filled(category.id) }} pathLength="1" d={d()} />
                </>
              );
            }}
          </For>

          {/* A light runs round the circle once anything is placed; a second joins it at seven. */}
          <path class="comet" classList={{ on: s.count() > 0 }} pathLength="1" d={circlePath(narrow())} />
          <path class="comet two" classList={{ on: s.complete() }} pathLength="1" d={circlePath(narrow())} />

          {/* At seven, two rings leave the core and cross the whole circle. */}
          <circle class="burst" cx={m().cx} cy={m().cy} r={m().R} />
          <circle class="burst late" cx={m().cx} cy={m().cy} r={m().R} />
        </svg>

        <Core
          engineer={s.engineer()}
          style={{ left: `${(m().cx / m().w) * 100}%`, top: `${(m().cy / m().h) * 100}%` }}
        />

        <For each={categories}>
          {(category) => {
            const person = () => readSeat(s.engineer(), category.id);
            const focus = () => s.focus();
            const open = () => {
              const f = focus();
              return f.kind === "category" && f.categoryId === category.id;
            };
            return (
              <div
                class="slot"
                classList={{
                  open: open(),
                  magnet: s.magnet() === category.id,
                  lifted: s.lifted().seat === category.id,
                  filled: Boolean(person()),
                }}
                data-category={category.id}
                style={{ left: `${layout()[category.id].x}%`, top: `${layout()[category.id].y}%` }}
              >
                <Show
                  when={person()}
                  fallback={<Hole category={category} open={open()} onOpen={(button) => s.openCategory(category.id, button)} />}
                >
                  {(current) => (
                    <>
                      <span class="caption">{category.name}</span>
                      <SeatCard
                        category={category}
                        person={current()}
                        line={s.engineer().lines[category.id]}
                        open={open()}
                        onOpen={(button) => s.unlessDragged(() => s.openCategory(category.id, button))()}
                        onPerson={(button) => s.openPerson(current().id, button)}
                        onLift={(event) => s.lift(event, { kind: "seat", categoryId: category.id })}
                      />
                    </>
                  )}
                </Show>
              </div>
            );
          }}
        </For>

      </div>
    </div>
  );
}
