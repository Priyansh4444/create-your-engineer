# TODO

## Changelog

- The shape is one true circle. Seven seats, humor at the top, 360/7 degrees apart, every seat the same distance from the core. It had been an oval, so the seats looked unevenly spaced; geometry now lives in SVG units that match the stage, and a check measures it at nine sizes.
- Motion is SVG and minimal. A light runs round the circle once anything is placed, a second joins at seven, lines draw themselves in, and two rings cross the circle from the core at seven. The sparks, confetti, flashes, tilting cards, and entrance animations are gone.
- The middle is a ring of seven arcs around an orb that grows as seats fill.
- Marks are the smallest form of each logo: 79 icons built by `scripts/build-icons.mjs`, using the logos' own published files where they keep real colours (Google, Convex, Figma, Dropbox, PayPal, Neovim, Node.js, Ghostty, Firefox, tRPC, Redis, Cloudflare, Django, YouTube, Meta), with the real lockup as a fallback and the plain name after that. People also carry what they work on (Vue, Vite and Oxc for Evan You; OpenCode and Effect for Kit; Helium and Cobalt for wukko).
- Link card: the Worker draws a 1200×630 OG image on the fly for any link, and tags every page with it, so a shared `?c=` link unfurls as that engineer. Always on it: the Helium and imput marks and `imput.net`. This replaced the upload-and-store path; the KV namespace is deleted. Copy puts the image on the clipboard. A GitHub link is in the header.
- Shuffle: a button beside the filter gives the deck a new random order.
- Everyone has a mark. Added the real logos for The Pragmatic Engineer, Molly Rocket, CrunchLabs, Discovery Loop, AngelList, Block, imput, tldraw, Helium, and Cobalt. Where a company has no published logo at all (Thinking Machines, Safe Superintelligence, Keen, Compose, and Independent), the card shows the X mark.
- 115 people. Added Tibo, Thariq, Andrew Ambrosino, Dan Abramov, David Cramer, and the Abstract (Convex, 2 September 2026) speakers whose X handles could be confirmed: James Cowling, Zeno Rocha, John Maeda, Paul Bakaus, Josh Puckett, and Seth Raphael (@magicseth). Boris Cherny, Jamie Turner, and Theo were already in.
- 104 people before that. Added wukko, Mark Zuckerberg, Ryan Fleury, Julius Marminge, and mark (@r_marked, both at T3), and others. Removed Guido van Rossum, Bryan Cantrill, Linus Sebastian, and MrBeast.
- Jobs checked against search and X bios: Micky is now at Convex; Jeff Dean left Google on 5 August 2026 to co-found Discovery Loop; Demis Hassabis is Alphabet's chief scientist; Teej's bio lists Neovim core and terminal.shop; Cursor is inside SpaceX; Ryan Vogel is OpenCode via Neon and Databricks.
- The repo is on GitHub. Portraits are not committed; `scripts/fetch-faces.mjs` fetches them.

## Left

- X bios could not be read for most of the roster: X blocks anonymous access and the syndication endpoint rate limits after a handful of requests. The checked ones are above; the rest are best effort as of 2026-10-03. Micky's bio reads "Developer, Youtuber, and a16z scout" and does not mention Convex; the Convex role is as the user stated.
- The first uncached card takes about a second (the Worker reads the files and starts resvg); one cold request returned a 503 once in testing and worked on retry. Cards are cached after that.
- Julius Marminge's X bio could not be read, so his T3 role and the tRPC link come from the request and his open-source work; his portrait is his GitHub avatar. @r_marked's bio reads "software should feel good to use".
- Not re-verified: Ethan Niser, Dara, Lauren Tan, Jhey Tompkins, Matt Pocock, Rhys Sullivan's YC chapter.
- Marks: Thinking Machines, Safe Superintelligence, Keen, Compose, Boot.dev, Bump, PartyKit, Anomaly, AI Hero, and id have no published logo, so they show their name in the peek and the card falls back to the X mark. The Pragmatic Engineer's and Molly Rocket's logos are published only as raster images, wrapped as they are.
- Grant Sanderson and Derek Muller have channel logos as portraits, because Wikipedia has no photo and X avatars were rate limited. Swap in the X avatars with `scripts/fetch-faces.mjs` when it is allowed.
- On a 667px-tall phone the circle is clamped to a readable minimum and the lowest seats scroll under the sheet.
- Abstract speakers not added because no X handle could be confirmed: Meagan Rose Gamache (Cloudflare), Luke Whiting (Convex), Diana Tobey (IDEO), Shona Dutta, Angel Steger (Wealthfront), and Jean-Denis Grèze (Town). Send handles and they go straight in.
- Dan Abramov's current employer is unclear (his X bio is just "Programmeur"); he is listed as independent after Meta and Bluesky, and his portrait is his GitHub photo because his X avatar is blank.
- Daniela Amodei stays out until a portrait and employment check out.
