import { Show } from "solid-js";
import { markLabel, type Category, type MarkId, type Person } from "./domain";
import { CurrentMark } from "./logos";

/** The role, unless it only repeats a company or project that is already shown as a mark or in the chain. */
export function roleOf(role: string, marks: readonly MarkId[]): string {
  const text = role.toLowerCase();
  const repeats = marks.some((id) => {
    const name = markLabel(id).toLowerCase();
    return text.includes(name) || name.includes(text);
  });
  return repeats ? "" : role;
}

export function Art(props: { person: Person; eager?: boolean }) {
  return (
    <>
      <img
        class="art"
        src={props.person.portrait}
        alt=""
        draggable={false}
        decoding="async"
        loading={props.eager ? "eager" : "lazy"}
      />
      <span class="shade" />
    </>
  );
}

/** An empty seat: its name in the middle, and what it asks. */
export function Hole(props: { category: Category; open: boolean; onOpen: (button: HTMLElement) => void }) {
  return (
    <div class="card hole">
      <button
        type="button"
        class="card-hit"
        aria-pressed={props.open}
        aria-label={`${props.category.name}, empty seat. ${props.category.asks}.`}
        onClick={(event) => props.onOpen(event.currentTarget)}
      />
      <span class="tag shine">{props.category.name}</span>
      <span class="asks">{props.category.asks}</span>
    </div>
  );
}

/** A filled seat: the person full-art, their mark in the corner, and the visitor's line. */
export function SeatCard(props: {
  category: Category;
  person: Person;
  line: string | undefined;
  open: boolean;
  onOpen: (button: HTMLElement) => void;
  onPerson: (button: HTMLElement) => void;
  onLift: (event: PointerEvent) => void;
}) {
  return (
    <div class="card seated">
      <button
        type="button"
        class="card-hit"
        aria-pressed={props.open}
        aria-label={`${props.category.name}, ${props.person.name}. Open seat.`}
        onPointerDown={props.onLift}
        onClick={(event) => props.onOpen(event.currentTarget)}
      >
        <Art person={props.person} eager />
      </button>
      <CurrentMark person={props.person} />
      <div class="copy">
        <button type="button" class="name" onClick={(event) => props.onPerson(event.currentTarget)}>
          {props.person.name}
        </button>
        <Show when={props.line}>
          <span class="line">{props.line}</span>
        </Show>
      </div>
    </div>
  );
}

/** A person in the deck. Dragging lifts it; a click takes it; the name opens them. */
export function DeckCard(props: {
  person: Person;
  taking: string | undefined;
  lifted: boolean;
  onLift: (event: PointerEvent) => void;
  onTake: (card: HTMLElement) => void;
  onPerson: (button: HTMLElement) => void;
}) {
  return (
    <div class="card deck-card" classList={{ lifted: props.lifted }} data-person={props.person.id} role="listitem">
      <button
        type="button"
        class="card-hit"
        aria-label={`Take ${props.person.name}${props.taking ? ` for ${props.taking}` : ""}`}
        onPointerDown={props.onLift}
        onClick={(event) => props.onTake(event.currentTarget.closest<HTMLElement>(".card")!)}
      >
        <Art person={props.person} />
      </button>
      <CurrentMark person={props.person} />
      <div class="copy">
        <button type="button" class="name" onClick={(event) => props.onPerson(event.currentTarget)}>
          {props.person.name}
        </button>
      </div>
    </div>
  );
}
