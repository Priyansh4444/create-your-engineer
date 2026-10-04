import { onCleanup, onMount, Show } from "solid-js";
import { Board } from "./board";
import { Deck } from "./deck";
import { attachKeys } from "./keys";
import { createStudio } from "./studio";

function Mark() {
  return (
    <svg class="mark" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.6" fill="none" stroke="currentColor" stroke-width="1.3" />
      <circle cx="10" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}

const repoUrl = "https://github.com/Priyansh4444/create-your-engineer";
/** Not every browser lets a page put an image on the clipboard. */
const canCopy = typeof ClipboardItem !== "undefined" && Boolean(navigator.clipboard?.write);

export default function App() {
  const studio = createStudio();
  onMount(() => onCleanup(attachKeys(studio)));

  return (
    <div class="app">
      <div class="main">
        <header class="header">
          <div class="brand">
            <Mark />
            <h1>Create your engineer</h1>
          </div>
          <div class="header-end">
            <Show when={studio.count() > 0}>
              <button type="button" class="pill" onClick={studio.reset}>
                Reset
              </button>
            </Show>
            <a class="icon-link" href={repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Source on GitHub" title="Source on GitHub">
              <img src="/icons/github.svg" alt="" width="18" height="18" />
            </a>
            <p class="count" aria-label={`${studio.count()} of 7 seats filled`}>
              {studio.count()} / 7
            </p>
          </div>
        </header>

        <div class="intro" classList={{ done: studio.complete() }}>
          <Show when={studio.complete()} fallback={<p>Drag a person onto each seat.</p>}>
            <p class="msg">All seven seats, one engineer.</p>
            <div class="acts">
              <button type="button" class="pill solid share" onClick={studio.share}>
                <img src="/icons/x.svg" alt="" width="12" height="12" />
                Share
              </button>
              <Show when={canCopy}>
                <button type="button" class="pill" disabled={Boolean(studio.busy())} onClick={() => void studio.copy()}>
                  {studio.busy() === "copying" ? "Copying" : studio.note() === "Image copied." ? "Copied" : "Copy"}
                </button>
              </Show>
              <button type="button" class="pill" disabled={Boolean(studio.busy())} onClick={() => void studio.save()}>
                {studio.busy() === "saving" ? "Saving" : "Save"}
              </button>
            </div>
          </Show>
        </div>

        <main>
          <Board studio={studio} />
        </main>
      </div>

      <Deck studio={studio} />

      <p class="sr" aria-live="polite" aria-atomic="true">
        {studio.live()}
      </p>
    </div>
  );
}
