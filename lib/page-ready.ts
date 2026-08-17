/** Fires once per page mount, the instant PageShell actually reveals
 * that page's content (see PageShell.tsx) — the one real signal for
 * "this specific navigation's destination is ready," as opposed to
 * DialNav's own rough guess (previously just "has painted a frame").
 *
 * Listeners are cleared on every notification, not just removed one at
 * a time — a stale listener registered for a previous page's readiness
 * must never fire again for a later, unrelated one. */
type Listener = () => void;
let listeners = new Set<Listener>();

export function notifyPageReady() {
  const current = listeners;
  listeners = new Set();
  current.forEach((callback) => callback());
}

export function onPageReady(callback: Listener) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
