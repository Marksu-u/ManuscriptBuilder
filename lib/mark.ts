export const MARK_TILE = '#0B0E1A';

/** A folded manuscript and wax seal, drawn on the same 32-unit grid as Dynasty's mark. */
export function markSvg(size = 32, { tile = true }: { tile?: boolean } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" fill="none">
  ${tile ? `<rect x=".5" y=".5" width="31" height="31" rx="7.5" fill="${MARK_TILE}" stroke="#333E58"/>` : ''}
  <path d="M8 5.5h11l5 5V25H8V5.5Z" fill="#EF9F27" stroke="#F5CF88" stroke-linejoin="round"/>
  <path d="M19 5.5v5h5" fill="#F5CF88" stroke="#9F6B21" stroke-linejoin="round"/>
  <path d="M11.5 13.5h9M11.5 17h7M11.5 20.5h4" stroke="#5B3E1B" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="22.5" cy="23.5" r="4.5" fill="#963B36" stroke="#D88665"/>
  <path d="m22.5 21 1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1 1-1.5Z" fill="#F5CF88"/>
</svg>`;
}
