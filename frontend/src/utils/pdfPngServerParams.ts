const MIN_DPI = 72;
const MAX_DPI = 600;

/**
 * The backend's DPI-based zoom (#448) is 1:1 with the client-side canvas
 * scale factor: zoom = dpi / 72. Clamped to the backend's accepted
 * [72, 600] range.
 */
export function resolveServerDpi(scale: number): number {
  const dpi = Math.round(scale * 72);
  return Math.min(Math.max(dpi, MIN_DPI), MAX_DPI);
}
