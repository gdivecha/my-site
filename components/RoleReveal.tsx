import { profile } from "@/lib/data/profile";

/** A plain fade/rise on mount (see role-reveal-fade in globals.css) — no
 * wipe, typewriter, or scramble. The "creative" part is static rather
 * than animated: every role after the first is rendered in the site's
 * own signature gradient (the same two stops as the name and the Skills
 * graph's root node), not plain text. */
export function RoleReveal() {
  const [primary, ...rest] = profile.roles;
  return (
    <span className="[animation:role-reveal-fade_500ms_ease-out_both] motion-reduce:[animation:none]">
      {primary}
      {rest.map((role) => (
        <span key={role}>
          <span className="mx-2 text-ink-faint">•</span>
          <span className="bg-gradient-to-r from-accent-soft to-accent-deep bg-clip-text text-transparent">
            {role}
          </span>
        </span>
      ))}
    </span>
  );
}
