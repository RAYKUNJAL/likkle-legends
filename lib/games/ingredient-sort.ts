/** How far a finger or mouse must move before a press becomes a drag. */
export const POINTER_DRAG_THRESHOLD = 12;

export type BasketProbe = {
  closest(selector: string): { getAttribute(name: string): string | null } | null;
};

export function dragExceeded(
  startX: number,
  startY: number,
  x: number,
  y: number,
  threshold = POINTER_DRAG_THRESHOLD,
): boolean {
  const dx = x - startX;
  const dy = y - startY;
  return Math.hypot(dx, dy) >= threshold;
}

/** Top-most element that sits inside a basket wins. The drag ghost is omitted by the caller. */
export function basketIdFromPoint(elements: BasketProbe[]): string | null {
  for (const element of elements) {
    const id = element.closest('[data-basket]')?.getAttribute('data-basket');
    if (id) return id;
  }
  return null;
}
