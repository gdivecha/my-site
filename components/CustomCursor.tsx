"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, summary, label";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -100, y: -100 });

  // Below md, never show this — even on a device that technically has a
  // fine pointer (a mouse plugged into a narrow window, an iPad in split
  // view, or just a desktop browser resized narrow, which is exactly how
  // this got tested during development). pointer:fine alone only rules
  // out touch-only devices, not "has a mouse but is at mobile width"
  // ones. Tracked as its own live-updating state (not just checked once
  // at mount) so actually resizing the window across the breakpoint
  // toggles it immediately instead of needing a reload.
  const [active, setActive] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const update = () => setActive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!active) return;

    const dot = dotRef.current;
    if (!dot) return;

    document.documentElement.classList.add("custom-cursor-active");

    // Record position on every mousemove (cheap), but only touch the DOM
    // once per animation frame — writing style.transform directly in the
    // mousemove handler let updates land out of sync with the browser's
    // paint cycle, which is what read as choppy.
    let frame = requestAnimationFrame(function render() {
      dot.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    });

    const handleMove = (event: MouseEvent) => {
      position.current.x = event.clientX;
      position.current.y = event.clientY;
    };

    const handleOver = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) {
        dot.classList.add("custom-cursor-dot--active");
      }
    };

    const handleOut = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) {
        dot.classList.remove("custom-cursor-dot--active");
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mouseout", handleOut);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mouseout", handleOut);
      cancelAnimationFrame(frame);
    };
  }, [active]);

  return <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />;
}
