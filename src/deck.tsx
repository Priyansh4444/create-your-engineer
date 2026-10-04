import { For, Show } from "solid-js";
import { Chain } from "./logos";
import { DeckCard, roleOf } from "./card";
import { maxLineLength, people, readSeat, writeLine } from "./domain";
import type { Studio } from "./studio";

/** What is open, if anything: a seat's line, or a person. Idle shows nothing at all. */
function Panel(props: { studio: Studio }) {
  const s = props.studio;
  return (
    <>
      <Show when={s.focusedCategory()}>
        {(category) => {
          const seated = () => readSeat(s.engineer(), category().id);
          return (
            <div class="panel">
              <div class="who">
                <span class="tag shine bright">{category().name}</span>
                <span class="asks-inline">{category().asks}</span>
              </div>
              <Show when={seated()} fallback={<p class="hint">Take a card for this seat.</p>}>
                <input
                  class="line-input"
                  type="text"
                  maxLength={maxLineLength}
                  placeholder="Write your own line"
                  aria-label={`Your line for ${category().name}`}
                  value={s.engineer().lines[category().id] ?? ""}
                  onInput={(event) => s.setEngineer(writeLine(s.engineer(), category().id, event.currentTarget.value))}
                />
              </Show>
              <div class="actions">
                <Show when={seated()}>
                  <button type="button" class="pill" onClick={() => s.clear(category().id)}>
                    Clear
                  </button>
                </Show>
                <button type="button" class="pill" onClick={s.idle}>
                  Close
                </button>
              </div>
            </div>
          );
        }}
      </Show>

      <Show when={s.focusedPerson()}>
        {(person) => (
          <div class="panel">
            <div class="who">
              <img class="peek-face" src={person().portrait} alt="" />
              <div class="peek-id">
                <strong>{person().name}</strong>
                <Show when={roleOf(person().role, [...person().companies, ...person().projects])}>{(role) => <span>{role()}</span>}</Show>
              </div>
            </div>
            <Chain ids={person().companies} label="Companies, earliest first" />
            <Show when={person().projects.length > 0}>
              <div class="works">
                <span class="works-label">Works on</span>
                <Chain ids={person().projects} label="Projects" arrows={false} />
              </div>
            </Show>
            <div class="actions">
              <a class="pill link" href={person().xUrl} target="_blank" rel="noopener noreferrer">
                x.com/{person().handle}
              </a>
              <Show when={!s.complete()}>
                <button type="button" class="pill solid" onClick={() => s.fillFrom(person().id)}>
                  Fill empty seats
                </button>
              </Show>
              <button type="button" class="pill" onClick={s.idle}>
                Close
              </button>
            </div>
          </div>
        )}
      </Show>
    </>
  );
}

export function Deck(props: { studio: Studio }) {
  const s = props.studio;
  let grid!: HTMLDivElement;
  return (
    <aside class="deck" aria-label="People">
      <div class="tools">
        <label class="filter">
          <span class="sr">Filter people</span>
          <input
            type="search"
            placeholder={`Filter ${s.visible().length} of ${people.length}`}
            value={s.query()}
            onInput={(event) => s.setQuery(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          class="icon-btn"
          aria-label="Shuffle people"
          title="Shuffle"
          onClick={() => {
            s.shuffle();
            grid.scrollTo({ top: 0 });
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
            <path d="m18 2 4 4-4 4" />
            <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
            <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
            <path d="m18 14 4 4-4 4" />
          </svg>
        </button>
      </div>

      <Panel studio={s} />

      <div class="grid" role="list" ref={grid}>
        <For each={s.visible()} fallback={<p class="empty-grid">No one matches.</p>}>
          {(person) => (
            <DeckCard
              person={person}
              taking={s.focusedCategory()?.name}
              lifted={s.lifted().person === person.id}
              onLift={(event) => s.lift(event, { kind: "person", personId: person.id })}
              onTake={(card) => s.unlessDragged(() => s.take(person, card))()}
              onPerson={(button) => s.openPerson(person.id, button)}
            />
          )}
        </For>
      </div>
    </aside>
  );
}
