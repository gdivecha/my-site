"use client";

import type { CSSProperties } from "react";
import { profile } from "@/lib/data/profile";

/** Client component specifically so the year is always whatever the
 * viewer's own clock says — a server-rendered `new Date()` would get
 * baked into the static HTML at build/deploy time and only update on
 * the next rebuild, not at midnight on Jan 1 for anyone visiting an
 * already-deployed page. */
export function Copyright({
  className = "",
  style,
  ...rest
}: {
  className?: string;
  style?: CSSProperties;
  [key: `data-${string}`]: string | boolean | undefined;
}) {
  return (
    <p className={className} style={style} {...rest}>
      © {new Date().getFullYear()} {profile.name}. All rights reserved.
    </p>
  );
}
