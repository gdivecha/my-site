"use client";

import { useEffect } from "react";

// Stops the browser's native pinch-to-zoom / ctrl+scroll page zoom
// everywhere on the site — except inside the skills graph, which has its
// own intentional pan/zoom and already calls preventDefault on its own
// wheel handler. Browsers report trackpad pinch gestures as wheel events
// with ctrlKey:true (not an actual key press), so checking ctrlKey here
// catches both pinch and real Ctrl/Cmd+scroll. Deliberately does NOT try
// to block Cmd/Ctrl+Plus/Minus keyboard zoom — that's a protected
// accessibility shortcut modern browsers ignore preventDefault for
// anyway, so attempting it would just be dead code.
export function DisableZoomGesture() {
  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      if (event.ctrlKey) event.preventDefault();
    }
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return null;
}
