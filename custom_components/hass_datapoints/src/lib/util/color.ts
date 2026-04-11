export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Return "#fff" or "#000" whichever has better contrast against the given hex
 * background colour, using the WCAG relative-luminance formula.
 */
export function contrastColor(
  hex: Nullable<string> | undefined
): "#fff" | "#000" {
  if (!hex || typeof hex !== "string") {
    return "#fff";
  }
  const h = hex.replace("#", "");
  if (h.length !== 6) {
    return "#fff";
  }
  const r = Number.parseInt(h.substring(0, 2), 16) / 255;
  const g = Number.parseInt(h.substring(2, 4), 16) / 255;
  const b = Number.parseInt(h.substring(4, 6), 16) / 255;
  const lin = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.179 ? "#000" : "#fff";
}
