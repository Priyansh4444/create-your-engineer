# TODO

## Changelog

- The shape is one true circle. Seven seats, humor at the top, 360/7 degrees apart, every seat the same distance from the core. It had been an oval, so the seats looked unevenly spaced; geometry now lives in SVG units that match the stage, and a check measures it at nine sizes.
- Motion is SVG and minimal. A light runs round the circle once anything is placed, a second joins at seven, lines draw themselves in, and two rings cross the circle from the core at seven. The sparks, confetti, flashes, tilting cards, and entrance animations are gone.
- The middle is a ring of seven arcs around an orb that grows as seats fill.
- Marks are the smallest form of each logo: 78 icons built by `scripts/build-icons.mjs`, with the real lockup as a fallback and the plain name after that. People also carry what they work on (Vue, Vite and Oxc for Evan You; OpenCode and Effect for Kit; Helium and Cobalt for wukko).
- Share on X: a Worker and a KV store keep a 1200×630 card and serve the tags X unfurls into a large image. Copy puts the image on the clipboard. A GitHub link is in the header.
- Shuffle: a button beside the filter gives the deck a new random order.
- 102 people. Added wukko, Mark Zuckerberg, Ryan Fleury, and others. Removed Guido van Rossum, Bryan Cantrill, Linus Sebastian, and MrBeast.
- Jobs checked against search and X bios: Micky is now at Convex; Jeff Dean left Google on 5 August 2026 to co-found Discovery Loop; Demis Hassabis is Alphabet's chief scientist; Teej's bio lists Neovim core and terminal.shop; Cursor is inside SpaceX; Ryan Vogel is OpenCode via Neon and Databricks.
- The repo is on GitHub. Portraits are not committed; `scripts/fetch-faces.mjs` fetches them.

## Left

- X bios could not be read for most of the roster: X blocks anonymous access and the syndication endpoint rate limits after a handful of requests. The checked ones are above; the rest are best effort as of 2026-10-03. Micky's bio reads "Developer, Youtuber, and a16z scout" and does not mention Convex; the Convex role is as the user stated.
- Not re-verified: Ethan Niser, Dara, Lauren Tan, Jhey Tompkins, Matt Pocock, Rhys Sullivan's YC chapter.
- Marks: these companies and projects have neither an icon nor a lockup, so they show their name in the peek and nothing on a card: Boot.dev, Bump, PartyKit, Anomaly, Keen, AI Hero, id, Molly Rocket, imput, Helium, Cobalt, and several others.
- Grant Sanderson and Derek Muller have channel logos as portraits, because Wikipedia has no photo and X avatars were rate limited. Swap in the X avatars with `scripts/fetch-faces.mjs` when it is allowed.
- On a 667px-tall phone the circle is clamped to a readable minimum and the lowest seats scroll under the sheet.
- Dan Abramov and Daniela Amodei stay out until a portrait and employment check out.
