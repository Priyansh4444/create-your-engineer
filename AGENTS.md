# Create your engineer

Operating guide for this repo. The product below is the source of truth. `README.md` is a short run guide only. Do not restore the old filter gallery, the pentagram, heptagram, or house layouts, or authored lines on people.

## What this is

A person composes a software engineer by picking **across humans**. The seven categories are seven seats on one true circle around a core. The visitor drags a person's card onto a seat. The result is one engineer, attributed seat by seat, and it can be saved as an image.

The visitor writes the words. Nothing on a person is a slogan, a quote, or a reading. An earlier draft gave every person seven authored lines. The user rejected that as cringe. Do not bring it back.

## Principles that fixed the shape

- **Exhaust the design space.** Filtered gallery, seat composer, and person dossiers were the real options. The seat composer won. A person can still be read whole as a peek.
- **Model the domain.** The engineer is a partial map from category to person, plus the visitor's own line per filled seat. Focus is one discriminated value. A line cannot exist without its seat.
- **Experience first.** One screen, one loop: drag a card onto a seat. No accounts, no second product. The only server is the small worker that draws the link card.
- **Seven categories, seven seats.** A pentagram left two seats with nowhere to go. A star of crossing lines then read as random. One circle with a seat every 360/7 degrees, a spoke from each seat to the core, and a ring that fills in is calm and means something: every lit line is a taken seat. The circle is a real circle: geometry is in SVG units that match the stage's shape, never percentages of a stretched box.

## Domain

Categories are abstract. They do not name languages, tools, frameworks, employers, or job titles. Humor is one of them.

| id | name | the seat asks |
| --- | --- | --- |
| `humor` | Humor | How lightly they hold the work |
| `taste` | Taste | What they refuse even when it works |
| `judgment` | Judgment | Where scarce attention goes |
| `care` | Care | What they will not leave behind |
| `nerve` | Nerve | What they will bet before it is proven |
| `clarity` | Clarity | How a tangled thing is made to speak |
| `tempo` | Tempo | The rhythm they keep when it gets loud |

```ts
type Person = {
  id: string;
  name: string;
  handle: string; // without @
  xUrl: `https://x.com/${string}`;
  role: string;
  companies: readonly CompanyId[]; // chronological, last is current
  portrait: string; // /faces/<id>.webp
};

/** Absent key = empty seat. Never store null. */
type Composition = Partial<Record<CategoryId, string>>;
/** The visitor's words. Exists only while its seat is filled. */
type Lines = Partial<Record<CategoryId, string>>;
type Engineer = { seats: Composition; lines: Lines };

type Focus =
  | { kind: "idle" }
  | { kind: "category"; categoryId: CategoryId }
  | { kind: "person"; personId: string };
```

Invalid and therefore unrepresentable: a line with no seat, two focuses at once, a company invented to fill a logo slot.

Pure helpers live in `src/domain.ts`: look up a person, read a seat, set, clear, swap two seats (the line travels with its seat), write a line, fill empty seats from one person, parse and serialize. UI does not reimplement those rules.

### Roster

`src/roster.ts` is the single list, in editorial order. The first nineteen are the original set and must not regress. Employment is best-effort public record as of 2026-10-02. Companies are chronological and the last is current. Do not drop an earlier company. Do not add a joke announcement.

Fixed facts: Prime is not on Omarchy. Micky's Convex "CEO" post was a parody. Sunil's current role is Cloudflare, not Vercel. Ethan left Vercel; do not invent a later employer. Evan's public role is SpaceXAI. Do not use Epic Games for Teej (Epic Systems). Rhys worked at Vercel, then YC. Theo includes Twitch. NeetCode is Google, then YouTube. Karpathy joined Anthropic in May 2026. Aiden Bai founds Million Software, not YouTube. Mario Zechner is at Earendil. Ben Dicken is PlanetScale. Peter Steinberger joined OpenAI in February 2026. Boris Cherny made Claude Code. Tibo (Thibault Sottiaux) leads Codex at OpenAI, Thariq is on Claude Code, and Andrew Ambrosino leads the Codex app. The Abstract conference speakers (abstract.convex.dev) are added where an X handle could be confirmed from a matching bio; the rest are left out rather than guessed.

To add a person: a verified handle, a real portrait at `public/faces/<id>.webp` (320px square, WebP), and a chronological company list checked against a source. Take the public X avatar. `unavatar.io` rate limits hard; `api.microlink.io/?url=https://x.com/<handle>` returns the same `pbs.twimg.com` image. Daniela Amodei stays out until a portrait and employment check out. Dan Abramov is in (asked for by name): his own site calls him an independent engineer after Meta and Bluesky. People come from the xearch dashboard (`search.pronsh.dev/api/youtubers`) and from who builds in public. Do not add org, science, repair, or conference channels.

## Marks

The smallest form of a logo, wherever there is one: an icon in `public/icons/<id>.svg`, built by `scripts/build-icons.mjs`. Prefer the real logo file as published online (svgl.app), unmodified, so it keeps its real colours; Google, Convex, and Figma are the cases that matter, because a single-colour glyph flattens them. Where svgl has nothing better, a simple-icons glyph in the brand colour; failing that, an existing symbol. Where no icon exists the real lockup in `public/logos/<id>.svg` stands in, and where there is neither the plain name shows. Never an abbreviation drawn to look like a mark, a hotlinked file, or a made-up brand. Dark brand colours become off-white so they read on black.

A mark can be a company or a project (`projects` on a person: Vue, Vite and Oxc for Evan You, OpenCode and Effect for Kit). A card shows one mark: the current company if it has one, else the first project that does, else the X mark, because everyone here is on X and nobody's card is bare. Never an earlier employer. Logos that exist only as a raster are wrapped in an SVG as published, resized and never redrawn. On a card the mark sits on a small dark plate, larger in the deck, where you choose, and small on a seat. The person peek lists the companies in order and, under "Works on", the projects. `src/marks.ts` holds the sets of ids that have an icon or a lockup.

## Experience

One screen. Desktop and a narrow phone.

1. A quiet header: a mark, the name, Reset when something is placed, a GitHub link, and `n / 7`.
2. One line under it. When all seven are filled it reads "All seven seats, one engineer." with three buttons: Share (on X, with the picture), Copy (the image to the clipboard, where the browser allows it), and Save.
3. **The board.** A near-black card with a light stippled into dither that drifts by transform. Seven seats on a circle, humor at the top and the rest clockwise, equally spaced. In the middle is the core: a ring of seven arcs, one per seat, around an orb that grows as seats fill. A spoke runs from every seat to the core. A spoke draws itself in when its seat is taken; a stretch of the circle draws in when both neighbours are taken. An empty seat shows its category name in the middle and what it asks. A filled seat is a full-art card: the category name sits above it, the company mark is small in the corner, and the name and the visitor's line sit at the bottom.
4. **The deck.** On desktop it is a sidebar that scrolls downwards: a filter with a shuffle button (a new random order), a context panel, and a grid of every person. On a phone it is a sheet along the bottom that scrolls downwards. The panel appears only while a seat or a person is open: the seat's line input with Clear and Close, or a person's peek. When idle there is no panel at all.
5. **Taking a person.**
   - Drag a card onto a seat. It is pulled toward the nearest seat and settles in. Release over nothing and it drifts home.
   - On landing the card settles and the category name rises from the middle of the seat to the line above the card.
   - Click or Enter on a card takes it into the open seat, or the next empty one, with the same flight.
   - Dragging a filled seat onto another swaps them.
   - On touch, a card lifts after a short hold, so a swipe still scrolls the deck.
6. **The person peek.** Activate a name on any card. It shows their portrait, role, every company in order, their x.com link, and one action: fill only the empty seats. Seats already taken stay.
7. Escape, or activating the open seat again, returns to idle. Escape inside the filter clears it first.
8. **Save** and **Copy** draw the filled engineer to a canvas (`src/poster.ts`). They do not clone the DOM. **Share** opens X's composer with the current link; the card X shows is drawn on the fly by the Worker (below).

The engineer lives in the query string: `?c=humor:prime,taste:guillermo&l=humor~words`. Unknown ids are dropped, a line without a filled seat is dropped, a partial composition is valid. Update with `history.replaceState`. No router.

### Feel

Vercel, then dither. Minimal and clear, and a little flashy where it counts. Ground is near-black. Type is off-white Geist. Muted text is gray. Borders are 1px at low white opacity. Corners are slightly rounded. No lime accent, no rainbow, no glassmorphism.

Motion is small and mostly SVG. A light runs round the circle once anything is placed, and a second joins it at seven. Lines draw themselves in. At seven, two rings leave the core and cross the whole circle, and the core's arcs spin up. That is all. No sparks, confetti, flashes, or tilting cards; an earlier pass had them and the user said it was too much. It has to stay smooth on a slow machine, so: no blend modes, no CSS filters or blurred shadows on anything that moves, no animated masks. `prefers-reduced-motion` stops all of it and skips the flights.

### Behavior details

- Seats and deck cards are real buttons. Focus rings stay visible. Arrow keys move among seats, and in the deck left and right move by card while up and down move by row. Enter activates. Escape closes.
- A live region announces a seat change: `Humor, The Primeagen.`
- External links: `target="_blank"` and `rel="noopener noreferrer"`. They never select a card.
- Phone: the same board and the same cards. The circle is on a taller stage sized to fit between the header and the sheet, so every seat is on screen while you drag.
- Copy stays short, and nothing is said twice. There is no footer. A role is dropped when it only repeats a company already shown ("At T3" under the T3 mark). A deck card shows the name and one mark, clear on its plate, because that is where you choose; on a seat the mark is small. Neither shows company names, a role, or the handle; the handle and the full company chain live in the person peek. The seat panel states what a seat asks only once its card is in, because the empty seat already says it. The saved image carries no counter.

## Files

- `src/domain.ts` — categories, companies and projects, types, engineer helpers, URL parse and serialize. No JSX.
- `src/roster.ts` — the people. `src/marks.ts` — which ids have an icon or a lockup. `src/icons.generated.ts` — written by `scripts/build-icons.mjs`.
- `src/layout.ts` — where the seven seats sit on the circle, wide and narrow.
- `src/studio.ts` — all state and every action: focus, taking, swapping, filling, shuffling, saving, copying, sharing, lifting a card. Components read it; they hold no rules.
- `src/App.tsx` — the page. `src/board.tsx` — the circle, the core, the seats. `src/core.tsx` — the core. `src/deck.tsx` — the filter, the panel, the grid. `src/card.tsx` — the three kinds of card. `src/logos.tsx` — mark images. `src/keys.ts` — keyboard.
- `src/drag.ts` — pointer drag with magnetic pull. `src/motion.ts` — the card in flight and landing. `src/styles.css` — the visual system, including the board's SVG animation.
- `src/canvas.ts`, `src/poster.ts` — the saved and copied image.
- `worker/index.ts` — the Worker (page tags, `/og.png`). `worker/og.ts` — the card's SVG. `worker/fonts/` — Geist, for the card (SIL OFL). `wrangler.jsonc`, `public/_headers` — Cloudflare config.
- `scripts/build-icons.mjs`, `scripts/fetch-faces.mjs` — marks and portraits.
- `src/main.tsx` stays the Solid entry. Stack stays Solid, Vite, TypeScript. Effect is a dependency; use it only if it removes a real branch.

## The link card (OG image)

Every link to the app unfurls with a 1200×630 card drawn for exactly what is in the link, with no upload and no storage. `worker/index.ts` runs only for `/` and `/og.png`:

- `GET /og.png?c=humor:addy,...` builds an SVG (`worker/og.ts`) and rasterises it with resvg-wasm and Geist. It shows the circle with the chosen portraits, their marks and names, the core growing with the seats, a headline ("Create your engineer" when empty, "My engineer" and "Built from …" otherwise), and a footer that is always there: the Helium and imput marks and `imput.net`. The result is cached per set of seats (Cache API, a week at the edge, a day in browsers). Bump `v=` in `cardKey` when the design changes.
- `GET /` serves the app's page with `og:` and `twitter:` tags added by HTMLRewriter, naming that link's card, so `?c=…` links unfurl as the person's own engineer.
- Resvg cannot read WebP, so the card uses 176px JPEG copies of the portraits (`public/faces/<id>.jpg`, made by `scripts/fetch-faces.mjs`).
- The Share button just opens `x.com/intent/post` with the link. Nothing is posted anywhere first.

## Deploy

Cloudflare Workers with static assets. No KV or other bindings. `bun run deploy` builds and runs `wrangler deploy` against the `create-your-engineer` Worker. Hashed assets are cached for a year; faces, icons, and logos for a day with revalidation.

## Source

https://github.com/Priyansh4444/create-your-engineer. Portraits are other people's avatars and are not committed (`public/faces/*.webp` is ignored); `node scripts/fetch-faces.mjs` fetches them. Marks are committed and are their owners' trademarks.

## Checks

- `bun run typecheck`
- `bun run build`
- In a browser, at 1440 and 390 wide: drag a card onto a seat, click-take, open a seat and write a line, swap two seats, open a person and fill empty seats without clobbering, shuffle, load a shared `?c=` URL, clear a seat, keyboard only, reduced motion, Save, Copy, and Share at 7 / 7, `curl` `/og.png` empty, partial, and full, touch hold-and-drag on the sheet. Confirm every seat is the same distance from the core and 360/7 degrees from its neighbours, no seat cards overlap, every seat is on screen, and the page does not scroll sideways.

## Out of scope

Accounts, auth, any backend beyond the card worker, analytics, more categories, quotes or lines written for people, and restoring the old catalog, the pentagram, the heptagram, or the house layout.
