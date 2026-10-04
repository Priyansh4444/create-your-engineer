import { For, Show } from "solid-js";
import { markLabel, type MarkId, type Person } from "./domain";
import { hasMark, isIcon, markOf, markSrc } from "./marks";

export function Lockup(props: { id: MarkId }) {
  return (
    <img
      class="lockup"
      classList={{ icon: isIcon(props.id) }}
      src={markSrc(props.id)}
      alt={markLabel(props.id)}
      title={markLabel(props.id)}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  );
}

export function CurrentMark(props: { person: Pick<Person, "companies" | "projects"> }) {
  return (
    <Show when={markOf(props.person)}>
      {(id) => (
        <span class="lockup-row" classList={{ icon: isIcon(id()) }}>
          <Lockup id={id()} />
        </span>
      )}
    </Show>
  );
}

/** Marks in order. An icon where there is one, a lockup next, the name where there is neither. */
export function Chain(props: { ids: readonly MarkId[]; label: string; arrows?: boolean }) {
  return (
    <ol class="chain" classList={{ plain: props.arrows === false }} aria-label={props.label}>
      <For each={props.ids}>
        {(id) => (
          <li>
            <Show when={hasMark(id)} fallback={<span class="chain-name">{markLabel(id)}</span>}>
              <Lockup id={id} />
            </Show>
          </li>
        )}
      </For>
    </ol>
  );
}
