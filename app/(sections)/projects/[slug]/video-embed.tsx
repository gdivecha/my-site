"use client";

import { useState } from "react";

export function VideoEmbed({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-accent bg-panel-alt">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          loaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent"
          aria-hidden="true"
        />
      </div>
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
