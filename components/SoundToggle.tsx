"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { isDialSoundMuted, setDialSoundMuted } from "@/lib/dial-sound";
import { VolumeOffIcon, VolumeOnIcon } from "./icons";

export function SoundToggle({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  // Muted by default (matches isDialSoundMuted's own default for a
  // first-ever visit) — the effect below only ever corrects this to
  // false once it confirms someone previously opted in.
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(isDialSoundMuted());
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setDialSoundMuted(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute dial sound" : "Mute dial sound"}
      aria-pressed={muted}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-icon-btn text-ink-soft transition-colors hover:bg-icon-btn-hover hover:text-ink ${className}`}
      style={style}
    >
      {muted ? (
        <VolumeOffIcon className="h-4 w-4" />
      ) : (
        <VolumeOnIcon className="h-4 w-4" />
      )}
    </button>
  );
}
