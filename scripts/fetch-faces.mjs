#!/usr/bin/env node
/**
 * Fetches the portraits the roster needs into public/faces/ (320px square WebP).
 *
 * The portraits are other people's public avatars, so they are not kept in this repository.
 * Run this once after cloning:  node scripts/fetch-faces.mjs
 *
 * Needs ffmpeg on the PATH. Skips anyone who already has a file. unavatar.io rate limits hard;
 * if it refuses, run the script again later.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { roster } from "../src/roster.ts";

await mkdir("public/faces", { recursive: true });

async function download(handle) {
  const response = await fetch(`https://unavatar.io/x/${handle}?fallback=false`, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`unavatar ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

let fetched = 0;
for (const person of roster) {
  const target = `public/faces/${person.id}.webp`;
  if (existsSync(target)) continue;
  try {
    const raw = `public/faces/${person.id}.src`;
    await writeFile(raw, await download(person.handle));
    execFileSync("ffmpeg", [
      "-loglevel", "error", "-y", "-i", raw,
      "-vf", "crop='min(iw,ih)':'min(iw,ih)':'(iw-min(iw,ih))/2':'(ih-min(iw,ih))*0.12',scale=320:320",
      "-c:v", "libwebp", "-quality", "80", target,
    ]);
    await rm(raw);
    fetched += 1;
    console.log("fetched", person.id);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } catch (error) {
    console.log("could not fetch", person.id, String(error.message ?? error));
  }
}
console.log(`${fetched} new portraits`);
