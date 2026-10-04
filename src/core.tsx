import { For } from "solid-js";
import { categories, readSeat, type Engineer } from "./domain";

/** One arc of the ring, between two angles in degrees (0 is straight up), as an SVG path on a 100 box. */
function arc(index: number, count: number): string {
  const gap = 7;
  const span = 360 / count;
  const point = (degrees: number) => {
    const a = ((degrees - 90) * Math.PI) / 180;
    return `${(50 + 44 * Math.cos(a)).toFixed(2)} ${(50 + 44 * Math.sin(a)).toFixed(2)}`;
  };
  return `M${point(index * span + gap / 2)} A44 44 0 0 1 ${point((index + 1) * span - gap / 2)}`;
}

/**
 * The middle of the board: a ring of seven arcs, one per seat, around an orb. An arc lights when
 * its seat is taken and the orb grows with them. At seven the orb is full.
 */
export function Core(props: { engineer: Engineer; style: Record<string, string> }) {
  const filled = () => categories.filter((category) => readSeat(props.engineer, category.id)).length;
  const fraction = () => filled() / categories.length;

  return (
    <div class="core" style={props.style} aria-hidden="true">
      <svg class="core-arcs" viewBox="0 0 100 100">
        <For each={categories}>
          {(category, index) => (
            <path
              class="core-arc"
              classList={{ on: Boolean(readSeat(props.engineer, category.id)) }}
              d={arc(index(), categories.length)}
            />
          )}
        </For>
      </svg>
      <span class="core-orb" style={{ transform: `scale(${0.12 + fraction() * 0.88})`, opacity: 0.25 + fraction() * 0.75 }} />
    </div>
  );
}
