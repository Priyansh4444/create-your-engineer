import type { MarkId, Person } from "./domain";
import { iconIds } from "./icons.generated";

/**
 * Marks with a real lockup (a wordmark) in `public/logos/`. Anything else renders its name as
 * plain text, never an abbreviation drawn to look like a mark.
 */
const lockups = new Set<string>(['a16z', 'aiengineer', 'airbnb', 'amazon', 'anduril', 'anthropic', 'apple', 'baidu', 'basecamp', 'brave', 'bun', 'cloudflare', 'cluely', 'coinbase', 'convex', 'cursor', 'databricks', 'deno', 'django', 'dropbox', 'earendil', 'effect', 'epic', 'eventbrite', 'expo', 'figma', 'flask', 'ghostty', 'google', 'guardian', 'joyent', 'libgdx', 'linear', 'meta', 'microsoft', 'million', 'mit', 'mozilla', 'neon', 'neovim', 'netflix', 'netlify', 'nextjs', 'nodejs', 'nvidia', 'nytimes', 'openai', 'openclaw', 'opencode', 'oxc', 'paypal', 'perplexity', 'planetscale', 'react', 'redis', 'remix', 'replit', 'rolldown', 'sentry', 'shopify', 'solid', 'sourcegraph', 'spacex', 'sst', 'stripe', 'svelte', 't3', 'tanstack', 'temporal', 'terraform', 'tesla', 'twitch', 'twitter', 'typescript', 'uber', 'vercel', 'vite', 'vitest', 'voidzero', 'vue', 'x', 'xai', 'ycombinator', 'youtube']);

/** The smallest form of a logo, when there is one: `public/icons/`. Preferred everywhere. */
export function isIcon(id: MarkId): boolean {
  return iconIds.has(id);
}

export function hasMark(id: MarkId): boolean {
  return iconIds.has(id) || lockups.has(id);
}

export function markSrc(id: MarkId): string {
  return isIcon(id) ? `/icons/${id}.svg` : `/logos/${id}.svg`;
}

/**
 * The one mark a card shows: the current company if it has one, otherwise the first project
 * that does (OpenCode for someone at Anomaly). Never an earlier employer.
 */
export function markOf(person: Pick<Person, "companies" | "projects">): MarkId | undefined {
  const current = person.companies[person.companies.length - 1];
  if (current && hasMark(current)) return current;
  return person.projects.find(hasMark);
}
