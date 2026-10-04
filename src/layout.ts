import { categories, type CategoryId } from "./domain";

export type Point = { x: number; y: number };

/**
 * Seven seats on one true circle, humor at the top, 360/7 degrees apart, clockwise, with the core
 * in the middle. Geometry is in SVG units that match the stage's own shape (so a circle stays a
 * circle at every size). The stage has two shapes: wide, and a taller one for phones.
 */
export function metrics(narrow: boolean): { w: number; h: number; cx: number; cy: number; R: number } {
  return narrow
    ? { w: 100, h: 140, cx: 50, cy: 72, R: 40 }
    : { w: 720, h: 700, cx: 360, cy: 362, R: 250 };
}

/** Where a seat's centre is, in percent of the stage. */
export function seatLayout(narrow: boolean): Record<CategoryId, Point> {
  const { w, h, cx, cy, R } = metrics(narrow);
  const layout = {} as Record<CategoryId, Point>;
  categories.forEach((category, index) => {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / categories.length);
    layout[category.id] = {
      x: ((cx + R * Math.cos(angle)) / w) * 100,
      y: ((cy + R * Math.sin(angle)) / h) * 100,
    };
  });
  return layout;
}

/** Each stretch of the orbit between two neighbouring seats. It lights when both are taken. */
export const arcs: readonly (readonly [CategoryId, CategoryId])[] = categories.map(
  (category, index) => [category.id, categories[(index + 1) % categories.length].id] as const,
);

/** SVG path along the circle between two seats, clockwise. */
export function arcPath(a: Point, b: Point, narrow: boolean): string {
  const { w, h, R } = metrics(narrow);
  const px = (p: Point) => `${((p.x / 100) * w).toFixed(2)} ${((p.y / 100) * h).toFixed(2)}`;
  return `M${px(a)} A${R} ${R} 0 0 1 ${px(b)}`;
}

/** The whole circle as one path, starting at the top and running clockwise. */
export function circlePath(narrow: boolean): string {
  const { cx, cy, R } = metrics(narrow);
  return `M${cx} ${cy - R} A${R} ${R} 0 1 1 ${cx} ${cy + R} A${R} ${R} 0 1 1 ${cx} ${cy - R}`;
}
