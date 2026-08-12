"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, summary, label";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

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
  }, []);

  return <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />;
}
