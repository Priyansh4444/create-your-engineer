# Create your engineer

Compose one engineer from seven people. Drag a person onto each of seven seats on a circle: humor, taste, judgment, care, nerve, clarity, tempo. Write your own line for each seat, then copy, save, or share the result on X.

**Live:** https://create-your-engineer.pronsh.workers.dev

The domain model and the interaction are in [AGENTS.md](AGENTS.md). What changed and what is left is in [TODO.md](TODO.md).

## Run locally

```sh
bun install
node scripts/fetch-faces.mjs   # portraits are not in the repo; needs ffmpeg
bun run dev
```

`bun run typecheck` checks the app and the worker. `bun run build` builds it.

## How it is built

- **App:** SolidJS, Vite, TypeScript. Motion is anime.js for the cards and SVG for the board.
- **Marks:** `node scripts/build-icons.mjs` builds the compact company and project icons from simple-icons and svgl.
- **Share on X:** a small Cloudflare Worker (`worker/index.ts`) stores a 1200×630 card in KV and serves a page with the tags X unfurls into a large image. Everything else is static assets.

## Deploy

```sh
bun run deploy
```

Builds and publishes to Cloudflare Workers (`wrangler.jsonc`). It needs `wrangler login` once and a KV namespace bound as `SHARES`.

## Notes

Company and project marks are trademarks of their owners, shown only to say where someone works or what they build. Portraits are people's public avatars; they are fetched, not redistributed.
