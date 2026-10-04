import type { MarkId, Person } from "./domain";
import { iconIds } from "./icons.generated";

/**
 * Marks with a real lockup (a wordmark) in `public/logos/`. Anything else renders its name as
 * plain text, never an abbreviation drawn to look like a mark.
 */
const lockups = new Set<string>(["a16z", "aiengineer", "amazon", "anduril", "angellist", "cluely", "crunchlabs", "epic", "eventbrite", "joyent", "libgdx"]);

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
 * that does (OpenCode for someone at Anomaly). Never an earlier employer. When a person's
 * company has no published logo at all, they still get the X mark, since every one of them is
 * on X. Everyone gets a little something.
 */
export function markOf(person: Pick<Person, "companies" | "projects">): MarkId {
  const current = person.companies[person.companies.length - 1];
  if (current && hasMark(current)) return current;
  return person.projects.find(hasMark) ?? "x";
}
