"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { TechLogo } from "@/components/TechIcon";
import { CodeBracketsIcon } from "@/components/icons";
import { ENTRANCE_MS, SIDEBAR_CASCADE_DONE_MS } from "@/lib/entrance-timing";
import type { SkillCategory } from "@/lib/data/skills";
import { categoryIcons } from "./category-icons";

// All of these are sized as a proportion of SIZE, deliberately — the SVG
// scales as one unit (viewBox + w-full), so a raw pixel value here only
// stays visually the same size across edits if SIZE never changes. It
// did change (to make room for bigger leaves) without these keeping
// pace, which is what actually shrank the root/category nodes on screen
// even though their numbers looked untouched.
const SIZE = 1750;
const CENTER = SIZE / 2;
const ROOT_RADIUS = 76;
const CATEGORY_RING = 343;
const CATEGORY_NODE_RADIUS = 57;
const SKILL_RING = 814;
// Capped by the actual geometry, not a guess: with 44 skills across 11
// categories, the tightest same-category neighbors land ~103px apart
// center-to-center at SKILL_RING's current radius — a fixed ceiling
// rotation can't change, since spinning the wheel moves every node
// rigidly together. 110-120 (tried earlier) mathematically overlapped
// in those tightest spots; 100 keeps real margin under that ceiling.
// Going bigger than this needs SKILL_RING itself pushed outward instead.
const SKILL_NODE_SIZE = 100;
// Half-width gap between each category's skill cluster and the next —
// smaller than a full slot's worth of angular space, reclaiming room
// that would otherwise sit empty so the leaves themselves can be bigger.
const GAP_SLOT_FRACTION = 0.5;
// Degrees the wheel turns per unit of wheel deltaY — tuned so a normal
// trackpad/mouse scroll gesture reads as a deliberate spin, not a hair-
// trigger flick.
const ROTATION_PER_DELTA = 0.15;
// Degrees the wheel turns per pixel of pointer drag — the touch/pointer
// equivalent of ROTATION_PER_DELTA above, for devices with no wheel to
// spin (phones, tablets, anything touch-only). Tuned so dragging roughly
// a third of the graph's width reads as a deliberate spin, matching the
// wheel's own feel rather than being hair-trigger or sluggish.
const DRAG_ROTATION_PER_PX = 0.4;
// Degrees per second the wheel spins on its own on mobile, when nothing
// is actively dragging it — slow enough to read as ambient motion, not
// a distraction from the icons themselves.
const AUTO_ROTATE_DEG_PER_SEC = 6;
// How long auto-rotate stays paused after the person releases a manual
// drag — "a few seconds" to actually look at what they just spun to,
// not an instant resume that reads as the spin fighting the gesture.
const AUTO_ROTATE_RESUME_DELAY_MS = 3000;

// Mobile frames the wheel tighter than desktop and off-center, rather
// than the full SIZE×SIZE square centered on the root — root sits fixed
// at (CENTER, CENTER) regardless of viewBox (it's always radius 0 in the
// polar layout), so offsetting the viewBox here is what actually pins it
// near the bottom-right corner of the frame instead of dead center, per
// the reference layout. Existing drag/wheel rotation needs no changes at
// all to work with this — every node's position is already recomputed
// from its own angle via polarPoint() on every rotationOffset change
// (not a CSS transform on a fixed layout), so nodes just naturally swing
// into and out of whatever window this viewBox happens to show, staying
// upright the whole time with no counter-rotation needed.
// 0.62, not the tighter 0.58 tried first — the farthest-reaching
// direction from the corner-anchored root (straight "up") gets
// ROOT_SCREEN_FRACTION of this view's own size, and that needs to be
// enough to fully contain even the outermost skill nodes (SKILL_RING +
// SKILL_NODE_SIZE/2, ~867 units) when one rotates to face that
// direction — 0.58 gave only ~832, just short, which is exactly why
// top-of-circle nodes were disappearing instead of showing. 0.62 gives
// ~889, with real margin.
const MOBILE_VIEW = SIZE * 0.62;
const ROOT_SCREEN_FRACTION = 0.82;
// Pure sanity guard against a zero/negative computed size (e.g. a
// measurement that runs against a layout that hasn't settled yet) —
// deliberately NOT a "never go below this" design floor. The frame's
// bottom gap is measured to match its top gap exactly (see the
// useLayoutEffect below), so anything bigger than the real fit would
// eat back into that matched gap — on a genuinely short viewport (e.g.
// iPhone SE, 375×667) the real available space between the heading and
// the bottom nav bar can be under 100px. Shrinking the graph to actually
// fit is the correct trade-off over a size floor fighting the gap.
const MOBILE_FRAME_MIN_PX = 60;

type Point = { x: number; y: number };

// Math.cos/Math.sin can differ in their last decimal place between the
// server's Node engine and the browser's — normally invisible, but these
// values get embedded directly as text in the SVG `d`/x/y attributes, so
// that ULP-level difference was enough to make the server-rendered HTML
// disagree with the client's re-render and trigger a hydration mismatch.
// Rounding here means both sides land on the exact same string.
function round(n: number) {
  return Math.round(n * 100) / 100;
}

function polarPoint(radius: number, angleDeg: number): Point {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: round(CENTER + radius * Math.cos(angleRad)),
    y: round(CENTER + radius * Math.sin(angleRad)),
  };
}

type CategoryNode = {
  category: SkillCategory;
  angle: number;
} & Point;

type SkillNode = {
  categoryId: string;
  skill: SkillCategory["skills"][number];
  angle: number;
} & Point;

// Same method a proper circular dendrogram uses (D3's radial cluster
// layout): every LEAF gets equal angular spacing around the full circle,
// and each parent sits at the mean angle of its own children — not an
// angular sector sized per category. Giving categories variable-width
// wedges (proportional to their skill count) is what made an earlier
// version look lopsided and unbalanced; equal-angle leaves reads as a
// properly designed, symmetric graph regardless of how skills are
// distributed across categories. One empty slot after each category's
// skills doubles as the visual gap that separates one group from the
// next, without needing any explicit padding math.
function useGraphLayout(categories: SkillCategory[], rotationOffset: number) {
  return useMemo(() => {
    const totalSlots =
      categories.reduce((sum, c) => sum + c.skills.length, 0) +
      categories.length * GAP_SLOT_FRACTION;
    const slotAngle = 360 / totalSlots;

    const categoryNodes: CategoryNode[] = [];
    const skillNodes: SkillNode[] = [];

    let slot = 0;
    for (const category of categories) {
      const angles = category.skills.map(() => {
        const a = -90 + (slot + 0.5) * slotAngle + rotationOffset;
        slot += 1;
        return a;
      });
      slot += GAP_SLOT_FRACTION; // gap between this category and the next

      const categoryAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length;
      const { x, y } = polarPoint(CATEGORY_RING, categoryAngle);
      categoryNodes.push({ category, angle: categoryAngle, x, y });

      category.skills.forEach((skill, i) => {
        const p = polarPoint(SKILL_RING, angles[i]);
        skillNodes.push({ categoryId: category.id, skill, angle: angles[i], ...p });
      });
    }

    return { categoryNodes, skillNodes };
  }, [categories, rotationOffset]);
}

// A radial "S-curve": leaves the parent moving purely along its own
// radial direction, sweeps across to the child's angle at the midpoint
// radius, then arrives at the child moving purely along its radial
// direction — the standard construction behind D3's linkRadial curve.
// Reads as a flowing branch rather than a stiff straight spoke.
function radialLinkPath(parentAngle: number, parentR: number, childAngle: number, childR: number) {
  const midR = parentR + (childR - parentR) * 0.5;
  const start = polarPoint(parentR, parentAngle);
  const c1 = polarPoint(midR, parentAngle);
  const c2 = polarPoint(midR, childAngle);
  const end = polarPoint(childR, childAngle);
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
}

export function SkillGraph({ categories }: { categories: SkillCategory[] }) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const { categoryNodes, skillNodes } = useGraphLayout(categories, rotationOffset);
  const [hovered, setHovered] = useState<{ label: string } & Point>();
  // Starts false (desktop framing) so server and client agree on the
  // very first render — "use client" components still render once on
  // the server, where window doesn't exist, so this can't be decided
  // until after mount. Corrected in the layout effect below, before
  // paint, so mobile doesn't flash the desktop framing first.
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  // Locks the container's actual on-screen pixel size on mobile, rather
  // than trusting a flat `72vh` guess (see the old className comment
  // below) to leave enough room above/below it — that guess had no idea
  // how tall the heading/tab row above this component actually renders,
  // nor how much space the fixed-position bottom nav bar actually
  // reserves (which itself varies by device via env(safe-area-inset-
  // bottom)), so on some real viewports the square frame came out taller
  // than the space actually available and pushed root (anchored near its
  // bottom-right corner) off the bottom of the screen. Measuring the nav
  // bar's real rendered height directly (via its [data-dial-nav]
  // attribute) instead of hardcoding a pixel guess for it is what
  // actually accounts for that safe-area inset correctly on every
  // device, rather than guessing at one number that only happens to work
  // on some.
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileFrameSize, setMobileFrameSize] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!isMobile) {
      setMobileFrameSize(null);
      return;
    }
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.top;
      // Measured off the parent, not `el` itself — once `el` gets sized
      // by this same effect below, measuring its own rect here on a
      // later resize would cap every future measurement by whatever the
      // previous measurement produced instead of the page's actual
      // available width, shrinking a little further each time.
      const availableWidth =
        el.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      // Mirrors the frame's own right gap (the page's own horizontal
      // padding — see PageShell's px-6/sm:px-10 — since the frame is
      // right-aligned via ml-auto) as the bottom gap too, rather than a
      // separately-tuned constant. Read live off the actual rendered
      // position (window width minus the frame's own right edge) instead
      // of hardcoding a padding value, since which padding class is
      // active depends on the viewport width itself (px-6 vs sm:px-10).
      const rightGap = window.innerWidth - rect.right;
      const navEl = document.querySelector<HTMLElement>("[data-dial-nav]");
      const reservedBottom = (navEl?.getBoundingClientRect().height ?? 0) + rightGap;
      const availableHeight = window.innerHeight - top - reservedBottom;
      setMobileFrameSize(
        Math.max(MOBILE_FRAME_MIN_PX, Math.min(availableHeight, availableWidth))
      );
    }
    measure();
    window.addEventListener("resize", measure);
    // The heading/tab row above this component is still mid-entrance
    // (fade+slide) at the exact moment this layout effect first runs, so
    // that first measurement's `top` can be off by however far that
    // slide still has left to go — confirmed via a real measurement
    // (~20px on mobile) that only shows up once the animation actually
    // settles, not something a resize event ever fires for. Re-measuring
    // once more right as that entrance is known to finish (the same
    // "page content has settled" moment PageShell/DialNav already
    // synchronize on) corrects it without guessing at an arbitrary delay.
    const settleTimer = window.setTimeout(
      measure,
      SIDEBAR_CASCADE_DONE_MS + ENTRANCE_MS
    );
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(settleTimer);
    };
  }, [isMobile]);
  // Numeric bounds, not just the viewBox string — the tooltip below
  // (plain HTML, positioned by percentage) needs these same values to
  // place itself correctly once mobile's framing is no longer the
  // simple "0 0 SIZE SIZE" square its old (hovered.x / SIZE) math
  // assumed.
  const viewBoxBounds = isMobile
    ? {
        x: CENTER - MOBILE_VIEW * ROOT_SCREEN_FRACTION,
        y: CENTER - MOBILE_VIEW * ROOT_SCREEN_FRACTION,
        w: MOBILE_VIEW,
        h: MOBILE_VIEW,
      }
    : { x: 0, y: 0, w: SIZE, h: SIZE };
  const viewBox = `${viewBoxBounds.x} ${viewBoxBounds.y} ${viewBoxBounds.w} ${viewBoxBounds.h}`;
  // Touch/pointer-drag rotation — the wheel listener below has no touch
  // equivalent, so without this the whole wheel is inert on any
  // touch-only device (nodes visible, but nothing off-angle ever
  // reachable). Purely additive: the existing wheel-based rotation on
  // desktop is untouched, this is just a second, coexisting input method,
  // same relationship the connection graph's own pointer-drag pan has to
  // its wheel-driven zoom.
  const dragRef = useRef<{ startX: number; startRotation: number } | null>(null);
  // Timestamp (performance.now()-scale) auto-rotate stays paused until —
  // set on release, not just while dragRef is active, so the pause
  // outlasts the gesture itself (see handlePointerUp/the auto-rotate
  // effect below). 0 by default: nothing has been dragged yet, so
  // there's no reason to start paused.
  const pausedUntilRef = useRef(0);
  // Previous tick's paused state — lets the auto-rotate effect detect
  // the exact PAUSED→SPINNING transition (to clear a stale tooltip right
  // as the graph starts moving again) without that check re-running on
  // every already-spinning frame.
  const wasPausedRef = useRef(true);

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    dragRef.current = { startX: e.clientX, startRotation: rotationOffset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setRotationOffset(drag.startRotation + (e.clientX - drag.startX) * DRAG_ROTATION_PER_PX);
  }

  function handlePointerUp(e: PointerEvent<SVGSVGElement>) {
    // This same handler is also wired to onPointerLeave (see the SVG
    // below), which fires on plain mouse movement off the graph even
    // when nothing was ever actually dragged — checking dragRef here
    // (before clearing it) is what keeps that from continuously
    // re-triggering the post-drag pause on every casual mouse-out.
    // Confirmed empirically: without this check, hovering a node then
    // moving away was enough to keep resetting the pause indefinitely,
    // so auto-rotate never actually resumed.
    const wasDragging = !!dragRef.current;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    // Keeps auto-rotate paused for a few seconds after releasing too,
    // not just during the drag itself — a straight resume the instant
    // the finger lifts read as the spin fighting the gesture rather than
    // giving the person a moment to actually look at whatever they just
    // dragged into view.
    if (wasDragging) {
      pausedUntilRef.current = performance.now() + AUTO_ROTATE_RESUME_DELAY_MS;
    }
  }

  // Ambient auto-rotation on mobile — a rAF loop instead of setInterval
  // so the step scales with real elapsed time (frame-rate independent,
  // and immune to the big single jump a backgrounded/throttled tab would
  // otherwise produce on the next tick). Skips entirely while actively
  // dragging OR within AUTO_ROTATE_RESUME_DELAY_MS after releasing (see
  // pausedUntilRef, set in handlePointerUp) — manual interaction always
  // wins outright rather than fighting the auto-spin for control.
  // wasPausedRef tracks the previous tick's paused/spinning state
  // specifically to catch the PAUSED→SPINNING transition once — that's
  // the one moment a stale hover tooltip needs clearing, since the
  // node it's anchored to is about to start moving out from under it.
  useEffect(() => {
    if (!isMobile) return;
    let raf: number;
    let last = performance.now();
    function tick(now: number) {
      const dt = now - last;
      last = now;
      const paused = !!dragRef.current || now < pausedUntilRef.current;
      if (!paused) {
        if (wasPausedRef.current) setHovered(undefined);
        setRotationOffset((prev) => prev + (AUTO_ROTATE_DEG_PER_SEC * dt) / 1000);
      }
      wasPausedRef.current = paused;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  const categoryPos = new Map(categoryNodes.map((n) => [n.category.id, n]));

  // The graph is circular, so scrolling spins it around its own center
  // instead of scrolling the page past it — same trade-off the connection
  // graph already makes for pan/zoom. Listens on the whole window, not
  // just this element: the page itself can't scroll anywhere while this
  // view is mounted (see the body-overflow effect below), so there's
  // nothing else for a wheel gesture anywhere on screen to do anyway, and
  // restricting rotation to a tight hit-box around the visible nodes was
  // its own source of missed input at the edges. Scoped to exactly this
  // view regardless, since the listener is attached/removed with this
  // component's own mount/unmount. React's onWheel can't reliably
  // preventDefault (passive by default), so this is a real listener
  // instead, same approach as DisableZoomGesture.
  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      // The sidebar's own scroll-to-navigate dial needs real, unhijacked
      // wheel events to work at all — leave it alone wherever it's
      // interactable, rather than stealing every wheel gesture on screen.
      if ((event.target as HTMLElement).closest("[data-dial-nav]")) return;
      event.preventDefault();
      setRotationOffset((prev) => prev + event.deltaY * ROTATION_PER_DELTA);
    }
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Trying to give the wheel listener above enough hit-area to never miss
  // still leaves a real seam at the edge, so instead: while this view is
  // mounted, there's simply nothing to scroll to — the page itself can't
  // move vertically, and the graph is sized (see max-w-[min(...)] below)
  // to always fit within one viewport. Scrolling to the top on mount
  // guards against landing here already scrolled down from a taller
  // previous view. Restores normal scrolling on unmount (switching to
  // List view or the connection graph, or leaving the page), so this
  // never affects anywhere else on the site.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div>
      {/* max-w-[min(48rem,72vh)]: desktop-only sizing now — the viewBox is
          a perfect square, so an equivalent max-height is just the same
          value in width terms. Mobile instead gets an explicit pixel
          width/height below (mobileFrameSize), measured against the real
          viewport rather than trusting vh units to know how much space
          the heading/tab row above and the fixed bottom nav below
          actually consume. */}
      <div
        ref={containerRef}
        // mx-auto (centered) on desktop, where the frame is deliberately
        // the page's one focal square. On mobile that same centering is
        // what broke the anchor: root sits toward the frame's own
        // bottom-right corner (see ROOT_SCREEN_FRACTION), but whenever
        // the frame's square size is height-capped rather than
        // width-capped (see mobileFrameSize above), the frame itself
        // ends up narrower than the content column — centering it then
        // leaves dead space to its right, pulling the whole wheel
        // visibly away from the page's actual right margin instead of
        // hugging it. ml-auto (right-aligned) instead keeps the frame's
        // own right edge flush against the content column's right edge
        // regardless of how much narrower than full-width it ends up.
        className={`relative mt-12 w-full max-w-[min(48rem,72vh)] ${
          isMobile ? "ml-auto" : "mx-auto"
        }`}
        // Mobile only — desktop's full SIZE×SIZE view already contains
        // every node with margin to spare (see MOBILE_VIEW's own
        // comment), so nothing there ever actually reaches this edge.
        // Same masking technique the watermark already uses elsewhere
        // (see .watermark-field in globals.css) to fade content into
        // the frame's own edge instead of a bare CSS clip. Right/bottom
        // only, not top/left — root sits anchored near the bottom-right
        // corner (see ROOT_SCREEN_FRACTION), so those are the two edges
        // content actually approaches as it rotates; top/left stay
        // fully opaque instead of also dimming the graph's own interior.
        style={
          isMobile
            ? {
                ...(mobileFrameSize != null
                  ? {
                      width: mobileFrameSize,
                      height: mobileFrameSize,
                      maxWidth: mobileFrameSize,
                    }
                  : null),
                maskImage:
                  "linear-gradient(to bottom, black 90%, transparent), linear-gradient(to right, black 90%, transparent)",
                maskComposite: "intersect",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 90%, transparent), linear-gradient(to right, black 90%, transparent)",
                WebkitMaskComposite: "source-in",
              }
            : undefined
        }
      >
        <svg
          viewBox={viewBox}
          className="w-full touch-none cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Skills grouped by category, shown as a network graph you can spin by scrolling or dragging"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
          {/* Same two stops as the .text-gradient name treatment in the
              sidebar — ties the graph's focal point back to the site's
              one recurring gradient motif instead of inventing a new one. */}
          <linearGradient id="skillGraphRoot" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--color-accent-soft)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent-deep)" }} />
          </linearGradient>
          <radialGradient id="skillGraphGlow">
            <stop offset="0%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.14 }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="skillGraphCategoryGlow">
            <stop offset="0%" style={{ stopColor: "var(--color-accent-soft)", stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent-soft)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Soft ambient wash centered on the root — a static glow, not a
            hover effect, so it reads as deliberate atmosphere rather than
            the blur-heavy hover treatments this site avoids. Kept subtle
            and tight to the root — it's a hint of depth, not a spotlight. */}
        <circle cx={CENTER} cy={CENTER} r={CATEGORY_RING * 0.75} fill="url(#skillGraphGlow)" />

        {/* Spokes: root to each category (straight — always a true radial
            line since the root sits at radius 0, so a curve would add
            nothing), category to each of its skills (curved, see
            radialLinkPath). Tinted with the accent and fading outward as
            a depth cue. Drawn before the nodes so nodes paint over them. */}
        {/* accent-soft, not accent-deep — accent-deep is the one accent
            token that doesn't flip between themes (#4b3dc4 in both), so
            it read fine in light mode but too dark against the near-black
            dark-mode background. accent-soft is deliberately lighter in
            dark mode and richer in light mode (see globals.css), which is
            exactly the contrast this needs in both. */}
        <g className="stroke-accent-soft" fill="none">
          {categoryNodes.map((n) => (
            <line
              key={n.category.id}
              x1={CENTER}
              y1={CENTER}
              x2={n.x}
              y2={n.y}
              strokeWidth={1.6}
              opacity={0.85}
            />
          ))}
          {skillNodes.map((n) => {
            const parent = categoryPos.get(n.categoryId)!;
            return (
              <path
                key={n.skill.name}
                d={radialLinkPath(parent.angle, CATEGORY_RING, n.angle, SKILL_RING)}
                strokeWidth={1.2}
                opacity={0.55}
              />
            );
          })}
        </g>

        {/* Root node — the graph's one focal point, so it gets the
            boldest treatment: the site's signature gradient plus a glow. */}
        <circle cx={CENTER} cy={CENTER} r={ROOT_RADIUS} fill="url(#skillGraphRoot)" />
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--color-base)] text-[30px] font-bold"
        >
          Skills
        </text>

        {/* Category nodes — each gets its own soft glow (the graph's
            second tier of visual weight, between the root and the many
            quiet skill leaves) and a darker filled disc. Labels show on
            hover (see the tooltip below) rather than always-on text, same
            as the skill leaves — keeps the wheel legible as it spins
            instead of a ring of text sweeping past at every angle. A
            node rotating out of frame on mobile is clipped by the SVG's
            own viewBox rather than hidden outright — the fade mask on
            the frame itself (see the container div's style above) is
            what keeps that from reading as a hard cutout. */}
        {categoryNodes.map((n) => {
          const CategoryIcon = categoryIcons[n.category.id] ?? CodeBracketsIcon;
          return (
            <g
              key={n.category.id}
              onMouseEnter={() => setHovered({ label: n.category.label, x: n.x, y: n.y })}
              onMouseLeave={() => setHovered(undefined)}
              className="cursor-default"
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={CATEGORY_NODE_RADIUS + 10}
                fill="url(#skillGraphCategoryGlow)"
              />
              <circle cx={n.x} cy={n.y} r={CATEGORY_NODE_RADIUS} className="fill-graph-node-bg" />
              <foreignObject
                x={n.x - 25}
                y={n.y - 25}
                width={50}
                height={50}
                className="pointer-events-none overflow-visible"
              >
                <div className="flex h-[50px] w-[50px] items-center justify-center text-accent-soft">
                  <CategoryIcon className="h-12 w-12" />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Skill leaf nodes — real brand-colored logos via TechLogo, same
            as the accordion view's expanded tech chips, so this reads as
            the same skill set rather than a separate abbreviated one.
            Deliberately no glow at this tier — 34 of them glowing would
            drown out the root/category hierarchy this graph is built to
            show, so they stay quiet until hovered. */}
        {skillNodes.map((n) => {
          return (
          <g
            key={n.skill.name}
            onMouseEnter={() => setHovered({ label: n.skill.name, x: n.x, y: n.y })}
            onMouseLeave={() => setHovered(undefined)}
            className="cursor-default"
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={SKILL_NODE_SIZE / 2 + 3}
              className="fill-transparent"
            />
            <foreignObject
              x={n.x - SKILL_NODE_SIZE / 2}
              y={n.y - SKILL_NODE_SIZE / 2}
              width={SKILL_NODE_SIZE}
              height={SKILL_NODE_SIZE}
              className="overflow-visible"
            >
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-tech-icon-bg p-2 shadow-sm transition-shadow duration-150 hover:shadow-md">
                <TechLogo
                  skill={n.skill}
                  className="h-[82px] w-[82px]"
                  fallbackTextClassName="text-xl"
                />
              </div>
            </foreignObject>
          </g>
          );
        })}
      </svg>

      {hovered && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md border border-line bg-panel-alt px-2 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-sm"
          style={{
            left: `${((hovered.x - viewBoxBounds.x) / viewBoxBounds.w) * 100}%`,
            top: `${((hovered.y - viewBoxBounds.y) / viewBoxBounds.h) * 100}%`,
          }}
        >
          {hovered.label.toUpperCase()}
        </span>
      )}
      </div>
    </div>
  );
}
