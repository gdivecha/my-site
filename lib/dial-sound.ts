/** Whether the dial's tick sound is muted. Deliberately in-memory only —
 * not persisted to localStorage/sessionStorage. Both of those survive a
 * real page refresh, which is exactly wrong here: a genuine reload or
 * fresh load should always start muted again, while switching tabs via
 * the site's own client-side navigation (no reload — same JS runtime,
 * this module never re-evaluates) should keep whatever was chosen
 * during the visit so far. A plain in-memory variable does exactly
 * that: it resets to its initial value on every real load and nothing
 * else. Lives here rather than inside DialNav.tsx or SoundToggle.tsx
 * because both need it: DialNav checks it before ever touching
 * AudioContext, SoundToggle reads/writes it. */
let muted = true;

export function isDialSoundMuted(): boolean {
  return muted;
}

export function setDialSoundMuted(next: boolean) {
  muted = next;
}
