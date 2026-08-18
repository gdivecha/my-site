"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { TechLogo } from "@/components/TechIcon";
import { CodeBracketsIcon } from "@/components/icons";
import {
  categoryConnections,
  skillConnections,
} from "@/lib/data/skill-connections";
import type { SkillCategory, SkillTag } from "@/lib/data/skills";
import { categoryIcons } from "./category-icons";

const SIZE = 2000;
const CENTER = SIZE / 2;
const ROOT_RADIUS = 60;
const CATEGORY_NODE_RADIUS = 58;
const SKILL_NODE_SIZE = 64;
// Every zoomed-out dot — category or skill — renders at this one size;
// only the fill color tells them apart. Sized generously so dots stay
// clearly visible even zoomed all the way out to MAX_VIEW, rather than
// shrinking to near-invisible specks.
const DOT_RADIUS = 24;
// One width for every line in the graph, regardless of type or weight —
// only color and opacity distinguish them now, not thickness.
const LINE_WIDTH = 1.4;

// The box's initial framing and how far you can zoom either way — all
// relative to SIZE so they stay meaningful regardless of canvas size.
const DEFAULT_VIEW = SIZE * 0.62;
const MIN_VIEW = SIZE * 0.22;
const MAX_VIEW = SIZE * 1.35;
// Past this zoomed-out level, skill tiles simplify into plain dots —
// legible network shape instead of illegible tiny logos.
const LOD_VIEW_THRESHOLD = SIZE * 0.85;

function round(n: number) {
  return Math.round(n * 100) / 100;
}

type Point = { x: number; y: number };
type CategoryNode = { category: SkillCategory } & Point;
type SkillNode = { skill: SkillTag; categoryId: string } & Point;

// A genuine free-form force simulation — root, categories, and skills are
// all particles in the same system, not a fixed ring with satellites
// orbiting it. Root is pinned at the exact canvas center (the graph's
// one deliberate anchor — everything else is fully free); every other
// node moves purely under four forces: mutual repulsion (very strong, so
// nothing crowds), a spring along every edge pulling toward an ideal
// distance (root↔category and category↔skill use a short "structural"
// distance so the hierarchy stays legible; the real skill↔skill and
// category↔category edges use a much longer distance, which is what
// lets genuinely-connected things drift toward each other across the
// canvas), and a gentle pull toward center so the whole system doesn't
// drift off canvas. Tuned by rendering the actual output repeatedly — an
// early pass let real edges overpower the category→skill bond entirely,
// scattering each category's own skills instead of clustering them; a
// later pass caused the classic stiff-spring blowup (positions diverging
// to nonsense magnitudes) until a per-step displacement cap was added,
// which is standard for this kind of iterative spring simulation.
// Positions/forces live in flat Float64Arrays indexed by integer, not a
// Map<string, ...> keyed by node id — the original version allocated a
// brand-new Map (plus one small object per node) on *every single one*
// of the 500 iterations, purely as GC churn, and paid a string-hash
// lookup for every force calculation instead of an array index. Same
// exact physics/output, ~5-8x less work per iteration: id→index is
// resolved once up front (for both nodes and edges), and the four
// per-iteration arrays are allocated once and zeroed (not reallocated)
// each pass.
function useHybridLayout(categories: SkillCategory[]) {
  return useMemo(() => {
    const skillEdges = skillConnections;
    const categoryEdges = categoryConnections;

    const ROOT_INDEX = 0;
    const allIds: string[] = ["__root__"];
    categories.forEach((c) => allIds.push(c.id));
    categories.forEach((c) => c.skills.forEach((s) => allIds.push(s.name)));
    const n = allIds.length;

    const idToIndex = new Map<string, number>();
    allIds.forEach((id, i) => idToIndex.set(id, i));

    const radius = new Float64Array(n);
    radius[ROOT_INDEX] = ROOT_RADIUS;
    categories.forEach((c) => {
      radius[idToIndex.get(c.id)!] = CATEGORY_NODE_RADIUS;
      c.skills.forEach((s) => {
        radius[idToIndex.get(s.name)!] = SKILL_NODE_SIZE / 2;
      });
    });

    const x = new Float64Array(n);
    const y = new Float64Array(n);
    x[ROOT_INDEX] = CENTER;
    y[ROOT_INDEX] = CENTER;
    // Deterministic seed (index-based circle — no Math.random, so server
    // and client start from the exact same positions).
    const seedRadius = SIZE * 0.3;
    for (let i = 0; i < n; i++) {
      if (i === ROOT_INDEX) continue;
      const a = (2 * Math.PI * i) / n;
      x[i] = CENTER + seedRadius * Math.cos(a);
      y[i] = CENTER + seedRadius * Math.sin(a);
    }

    const ROOT_CAT_DISTANCE = SIZE * 0.27;
    const ROOT_CAT_STRENGTH = 0.1;
    const CAT_SKILL_DISTANCE = SIZE * 0.085;
    const CAT_SKILL_STRENGTH = 1.2;
    const LINK_DISTANCE = SIZE * 0.32;
    const LINK_STRENGTH = 0.025;

    type SimEdge = { a: number; b: number; weight: number; distance: number; strength: number };
    const simEdges: SimEdge[] = [];
    categories.forEach((c) =>
      simEdges.push({
        a: ROOT_INDEX,
        b: idToIndex.get(c.id)!,
        weight: 1,
        distance: ROOT_CAT_DISTANCE,
        strength: ROOT_CAT_STRENGTH,
      })
    );
    categories.forEach((c) =>
      c.skills.forEach((s) =>
        simEdges.push({
          a: idToIndex.get(c.id)!,
          b: idToIndex.get(s.name)!,
          weight: 1,
          distance: CAT_SKILL_DISTANCE,
          strength: CAT_SKILL_STRENGTH,
        })
      )
    );
    skillEdges.forEach((e) =>
      simEdges.push({
        a: idToIndex.get(e.source)!,
        b: idToIndex.get(e.target)!,
        // A curated edge's weight is always 0 (see SkillEdge's own
        // comment) — floored to 1 here so it still pulls its two nodes
        // together in the simulation instead of exerting zero spring
        // force and just crossing the canvas as a straight line to
        // wherever repulsion happened to leave them, same fix already
        // applied to categoryEdges below.
        weight: Math.max(1, e.weight),
        distance: LINK_DISTANCE,
        strength: LINK_STRENGTH,
      })
    );
    categoryEdges.forEach((e) =>
      simEdges.push({
        a: idToIndex.get(e.source)!,
        b: idToIndex.get(e.target)!,
        weight: Math.max(1, e.weight),
        distance: LINK_DISTANCE,
        strength: LINK_STRENGTH,
      })
    );

    const CENTER_STRENGTH = 0.02;
    const REPEL_STRENGTH = SIZE * SIZE * 0.02;
    const MAX_STEP = SIZE * 0.02;
    const iterations = 500;

    const fx = new Float64Array(n);
    const fy = new Float64Array(n);

    for (let iter = 0; iter < iterations; iter++) {
      const temperature = 1 - iter / iterations;
      fx.fill(0);
      fy.fill(0);

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = x[i] - x[j];
          const dy = y[i] - y[j];
          const distSq = Math.max(1, dx * dx + dy * dy);
          const dist = Math.sqrt(distSq);
          const f = REPEL_STRENGTH / distSq;
          const fdx = (dx / dist) * f;
          const fdy = (dy / dist) * f;
          fx[i] += fdx;
          fy[i] += fdy;
          fx[j] -= fdx;
          fy[j] -= fdy;
        }
      }

      for (const edge of simEdges) {
        const dx = x[edge.b] - x[edge.a];
        const dy = y[edge.b] - y[edge.a];
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const f = (dist - edge.distance) * edge.strength * edge.weight;
        const fdx = (dx / dist) * f;
        const fdy = (dy / dist) * f;
        fx[edge.a] += fdx;
        fy[edge.a] += fdy;
        fx[edge.b] -= fdx;
        fy[edge.b] -= fdy;
      }

      for (let i = 0; i < n; i++) {
        fx[i] += (CENTER - x[i]) * CENTER_STRENGTH;
        fy[i] += (CENTER - y[i]) * CENTER_STRENGTH;
      }

      for (let i = 0; i < n; i++) {
        if (i === ROOT_INDEX) continue; // the one fixed anchor
        let dx = fx[i] * temperature;
        let dy = fy[i] * temperature;
        const mag = Math.hypot(dx, dy);
        if (mag > MAX_STEP) {
          dx = (dx / mag) * MAX_STEP;
          dy = (dy / mag) * MAX_STEP;
        }
        x[i] += dx;
        y[i] += dy;
      }
    }

    // Direct pairwise separation, using each node type's real radius —
    // simulated annealing settles close but rarely eliminates every last
    // near-overlap on its own.
    for (let pass = 0; pass < 100; pass++) {
      let moved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = x[i] - x[j];
          const dy = y[i] - y[j];
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minSeparation = radius[i] + radius[j] + 18;
          if (dist > 0 && dist < minSeparation) {
            const push = (minSeparation - dist) / 2;
            const ux = dx / dist;
            const uy = dy / dist;
            if (i !== ROOT_INDEX) {
              x[i] += ux * push;
              y[i] += uy * push;
            }
            if (j !== ROOT_INDEX) {
              x[j] -= ux * push;
              y[j] -= uy * push;
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    const categoryNodes: CategoryNode[] = categories.map((category) => {
      const i = idToIndex.get(category.id)!;
      return { category, x: round(x[i]), y: round(y[i]) };
    });
    const skillNodes: SkillNode[] = categories.flatMap((c) =>
      c.skills.map((skill) => {
        const i = idToIndex.get(skill.name)!;
        return { skill, categoryId: c.id, x: round(x[i]), y: round(y[i]) };
      })
    );

    return { categoryNodes, skillNodes, skillEdges, categoryEdges };
  }, [categories]);
}

type ViewBox = { x: number; y: number; w: number; h: number };

function defaultViewBox(): ViewBox {
  return {
    x: CENTER - DEFAULT_VIEW / 2,
    y: CENTER - DEFAULT_VIEW / 2,
    w: DEFAULT_VIEW,
    h: DEFAULT_VIEW,
  };
}

export function SkillConnectionGraph({ categories }: { categories: SkillCategory[] }) {
  const { categoryNodes, skillNodes, skillEdges, categoryEdges } = useHybridLayout(categories);
  const [hovered, setHovered] = useState<{ label: string } & Point>();
  const [viewBox, setViewBox] = useState<ViewBox>(defaultViewBox);
  const [legendOpen, setLegendOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startViewBox: ViewBox } | null>(null);
  // What's currently spotlit: either one hovered edge (that edge + its two
  // endpoints), or one hovered node (that node + every node it's directly
  // connected to, plus every edge between them) — drives the fade/full-
  // strength split below. null means nothing is hovered, so the graph
  // reads at its normal resting opacities.
  type Spotlight =
    | { kind: "edge"; a: string; b: string }
    | { kind: "node"; id: string; neighbors: Set<string> };
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);

  const categoryPos = new Map(categoryNodes.map((n) => [n.category.id, n]));
  const skillPos = new Map(skillNodes.map((n) => [n.skill.name, n]));
  const zoomedOut = viewBox.w > LOD_VIEW_THRESHOLD;

  // Every node's direct neighbors, across all four edge types (root↔
  // category, category↔category, category↔skill, skill↔skill) — the one
  // thing a node-hover spotlight needs that an edge-hover doesn't, so it's
  // only built here rather than threaded through the render loop below.
  const neighborsOf = useMemo(() => {
    const map = new Map<string, Set<string>>();
    function link(a: string, b: string) {
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a)!.add(b);
      map.get(b)!.add(a);
    }
    categoryNodes.forEach((c) => link("__root__", c.category.id));
    categoryEdges.forEach((e) => link(e.source, e.target));
    skillNodes.forEach((n) => link(n.categoryId, n.skill.name));
    skillEdges.forEach((e) => link(e.source, e.target));
    return map;
  }, [categoryNodes, categoryEdges, skillNodes, skillEdges]);

  // True while anything is hovered — every opacity calculation below
  // branches on this so nothing dims itself when there's simply nothing
  // being hovered yet.
  const spotlighting = spotlight !== null;
  function isSpotlitEdge(a: string, b: string) {
    if (!spotlight) return false;
    if (spotlight.kind === "edge") {
      return (spotlight.a === a && spotlight.b === b) || (spotlight.a === b && spotlight.b === a);
    }
    return (
      (a === spotlight.id && spotlight.neighbors.has(b)) ||
      (b === spotlight.id && spotlight.neighbors.has(a))
    );
  }
  function isSpotlitNode(id: string) {
    if (!spotlight) return false;
    if (spotlight.kind === "edge") return spotlight.a === id || spotlight.b === id;
    return id === spotlight.id || spotlight.neighbors.has(id);
  }
  // Faded-out level for anything not currently spotlit — just a light
  // touch, not a real dim, so the rest of the graph's shape and colors
  // stay easy to read while one edge is singled out.
  const FADE = 0.48;
  function edgeOpacity(base: number, a: string, b: string) {
    if (!spotlighting) return base;
    return isSpotlitEdge(a, b) ? 1 : base * FADE;
  }
  function nodeOpacity(id: string) {
    if (!spotlighting) return 1;
    return isSpotlitNode(id) ? 1 : FADE;
  }
  // A visible line thin enough to look right at rest is too thin to
  // reliably hover — this renders a fat, fully transparent line right on
  // top of it purely to catch the pointer, plus a slight strokeWidth bump
  // on the visible line itself once it's the spotlit one, so the hovered
  // edge reads as genuinely emphasized rather than just "less faded than
  // its neighbors." No mouseenter/mouseleave here — the data-edge-a/-b
  // markers are read by the single pointermove hit-test on the svg
  // instead (see updateSpotlightFromPointer), which is what actually
  // drives the spotlight.
  function EdgeHitArea({ x1, y1, x2, y2, a, b }: { x1: number; y1: number; x2: number; y2: number; a: string; b: string }) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="transparent"
        strokeWidth={14}
        data-edge-a={a}
        data-edge-b={b}
      />
    );
  }

  function zoomBy(factor: number, focus?: Point) {
    setViewBox((vb) => {
      const w = Math.min(MAX_VIEW, Math.max(MIN_VIEW, vb.w * factor));
      const h = w;
      const fx = focus ? (focus.x - vb.x) / vb.w : 0.5;
      const fy = focus ? (focus.y - vb.y) / vb.h : 0.5;
      const cx = vb.x + fx * vb.w;
      const cy = vb.y + fy * vb.h;
      return { x: cx - fx * w, y: cy - fy * h, w, h };
    });
  }

  // React's onWheel can't reliably preventDefault (attached passive by
  // default), which is exactly what was letting the page scroll behind
  // the graph while zooming — same issue and same fix as the category
  // graph (see skill-graph.tsx): a real listener via useEffect instead.
  // viewBoxRef mirrors the latest viewBox so the handler (attached once,
  // on mount) always reads current state without needing to be torn
  // down/re-attached on every zoom.
  const viewBoxRef = useRef(viewBox);
  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    function handleWheelNative(e: globalThis.WheelEvent) {
      e.preventDefault();
      const rect = svg!.getBoundingClientRect();
      const vb = viewBoxRef.current;
      const fx = vb.x + ((e.clientX - rect.left) / rect.width) * vb.w;
      const fy = vb.y + ((e.clientY - rect.top) / rect.height) * vb.h;
      zoomBy(e.deltaY > 0 ? 1.08 : 1 / 1.08, { x: fx, y: fy });
    }
    svg.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheelNative);
  }, []);

  // The frame itself is sized to fit within one viewport (see the
  // h-[min(...)] classes below), so there's nothing to gain by letting the
  // page scroll while this view is mounted — same call the category graph
  // already makes, but without forcing scroll position: unlike that view,
  // this one doesn't rely on the page being pinned to a specific spot for
  // its own wheel-to-zoom math, so there's no equivalent scrollTo needed
  // here, just the lock. Restores normal scrolling on unmount.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startViewBox: viewBox };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (drag && svg) {
      const rect = svg.getBoundingClientRect();
      const dx = ((e.clientX - drag.startX) / rect.width) * drag.startViewBox.w;
      const dy = ((e.clientY - drag.startY) / rect.height) * drag.startViewBox.h;
      setViewBox({ ...drag.startViewBox, x: drag.startViewBox.x - dx, y: drag.startViewBox.y - dy });
      return;
    }
    updateSpotlightFromPointer(e);
  }

  // The single source of truth for what's spotlit — reads whatever is
  // actually under the cursor on every move, via data-edge-a/-b and
  // data-node-id markers, instead of trusting a matching mouseenter and
  // mouseleave pair to both fire on the right element. That per-element
  // enter/leave approach genuinely got stuck: an edge's own onMouseLeave
  // could fail to fire (fast pointer movement over a 1.4px-wide hit
  // target, an in-between re-render swapping which DOM node is under the
  // cursor, etc.) and leave that edge spotlit indefinitely, even with the
  // pointer sitting over empty canvas well inside the frame. Re-deriving
  // the answer fresh on every single move is self-correcting by
  // construction — there's no stale "leave never fired" state to get
  // stuck in, because nothing is ever trusted to persist between events.
  function updateSpotlightFromPointer(e: PointerEvent<SVGSVGElement>) {
    const target = e.target as Element;
    const edgeEl = target.closest("[data-edge-a]");
    if (edgeEl) {
      const a = edgeEl.getAttribute("data-edge-a")!;
      const b = edgeEl.getAttribute("data-edge-b")!;
      setSpotlight((cur) => (cur?.kind === "edge" && cur.a === a && cur.b === b ? cur : { kind: "edge", a, b }));
      return;
    }
    const nodeEl = target.closest("[data-node-id]");
    if (nodeEl) {
      const id = nodeEl.getAttribute("data-node-id")!;
      setSpotlight((cur) =>
        cur?.kind === "node" && cur.id === id
          ? cur
          : { kind: "node", id, neighbors: neighborsOf.get(id) ?? new Set() }
      );
      return;
    }
    setSpotlight((cur) => (cur === null ? cur : null));
  }

  function handlePointerUp(e: PointerEvent<SVGSVGElement>) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="graph-frame relative w-full overflow-hidden rounded-2xl border border-line bg-base">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="h-[min(560px,56vh)] w-full cursor-grab touch-none active:cursor-grabbing md:h-[min(680px,62vh)]"
        role="img"
        aria-label="Skills grouped by category, and connected to each other by the projects and roles that used them together — pannable and zoomable"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        // Catch-all: an individual edge's own onMouseLeave (see
        // EdgeHitArea) can miss firing when the pointer exits fast enough,
        // leaving the spotlight stuck on. This fires whenever the cursor
        // leaves the graph entirely, regardless of which child last had
        // it, so the spotlight can never get stranded on.
        onMouseLeave={() => setSpotlight(null)}
      >
        <defs>
          <linearGradient id="connGraphRoot" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--color-accent-soft)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent-deep)" }} />
          </linearGradient>
          {/* A dotted canvas, like a design-tool artboard — pans and
              scales with everything else since it's drawn in the same
              user-space coordinates as the graph, not fixed to the
              viewport, so it reads as one continuous surface rather than
              a static backdrop behind a moving graph. */}
          <pattern id="connGraphGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            {/* fill-line (used for hairline borders elsewhere) is too
                faint to read as a grid at this size — fill-ink-faint is a
                solid, more visible token, dialed back with opacity so it
                still stays a background, not competing with the graph. */}
            <circle cx="2" cy="2" r="2.5" className="fill-ink-faint" opacity={0.4} />
          </pattern>
        </defs>

        <rect
          x={-SIZE}
          y={-SIZE}
          width={SIZE * 3}
          height={SIZE * 3}
          fill="url(#connGraphGrid)"
        />

        {/* Six line types. Every accent shade (accent, accent-soft,
            accent-deep) means one specific real relationship; ink-faint
            (solid for structural, dashed for inferred) covers everything
            that isn't a real, specific claim. All drawn from the site's
            existing tokens — no new hues invented — so each kind of
            relationship reads apart from the others at a glance. See the
            legend button for what each one means. */}

        {/* Root → category spokes: the graph's starting point and the
            structure everything else hangs off of. */}
        <g className="stroke-ink-faint transition-opacity duration-150" fill="none">
          {categoryNodes.map((c) => {
            const lit = isSpotlitEdge("__root__", c.category.id);
            return (
              <g key={c.category.id}>
                <EdgeHitArea x1={CENTER} y1={CENTER} x2={c.x} y2={c.y} a="__root__" b={c.category.id} />
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={c.x}
                  y2={c.y}
                  strokeWidth={lit ? LINE_WIDTH * 2 : LINE_WIDTH}                  opacity={edgeOpacity(0.55, "__root__", c.category.id)}
                  className="pointer-events-none transition-opacity duration-150"
                />
              </g>
            );
          })}
        </g>

        {/* Category ↔ category: how the categories themselves relate,
            derived from real skill-to-skill edges crossing category
            lines. */}
        <g className="stroke-accent-soft" fill="none">
          {categoryEdges.filter((e) => e.real).map((edge) => {
            const a = categoryPos.get(edge.source);
            const b = categoryPos.get(edge.target);
            if (!a || !b) return null;
            const lit = isSpotlitEdge(edge.source, edge.target);
            return (
              <g key={`${edge.source}-${edge.target}`}>
                <EdgeHitArea x1={a.x} y1={a.y} x2={b.x} y2={b.y} a={edge.source} b={edge.target} />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth={lit ? LINE_WIDTH * 2 : LINE_WIDTH}                  opacity={edgeOpacity(0.6, edge.source, edge.target)}
                  className="pointer-events-none transition-opacity duration-150"
                />
              </g>
            );
          })}
        </g>

        {/* Bridge edges: a category with zero real cross-links of its
            own, linked to the graph's most-connected category so it
            isn't a stray island. Muted ink, not an accent color — every
            accent shade already means a specific real relationship
            elsewhere in this graph, so an inferred/guessed link
            deliberately reads as "no real color assigned" instead of
            fighting for a hue that isn't actually free. Dashed is what
            actually carries the "inferred, not observed" distinction. */}
        <g className="stroke-ink-faint" fill="none">
          {categoryEdges.filter((e) => !e.real).map((edge) => {
            const a = categoryPos.get(edge.source);
            const b = categoryPos.get(edge.target);
            if (!a || !b) return null;
            const lit = isSpotlitEdge(edge.source, edge.target);
            return (
              <g key={`${edge.source}-${edge.target}`}>
                <EdgeHitArea x1={a.x} y1={a.y} x2={b.x} y2={b.y} a={edge.source} b={edge.target} />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth={lit ? LINE_WIDTH * 2 : LINE_WIDTH}                  opacity={edgeOpacity(0.6, edge.source, edge.target)}
                  strokeDasharray="10 10"
                  className="pointer-events-none transition-opacity duration-150"
                />
              </g>
            );
          })}
        </g>

        {/* Category → skill: how each category houses its skills. */}
        <g className="stroke-accent-deep" fill="none">
          {skillNodes.map((n) => {
            const home = categoryPos.get(n.categoryId);
            if (!home) return null;
            const lit = isSpotlitEdge(n.categoryId, n.skill.name);
            return (
              <g key={`house-${n.skill.name}`}>
                <EdgeHitArea x1={home.x} y1={home.y} x2={n.x} y2={n.y} a={n.categoryId} b={n.skill.name} />
                <line
                  x1={home.x}
                  y1={home.y}
                  x2={n.x}
                  y2={n.y}
                  strokeWidth={lit ? LINE_WIDTH * 2 : LINE_WIDTH}                  opacity={edgeOpacity(0.45, n.categoryId, n.skill.name)}
                  className="pointer-events-none transition-opacity duration-150"
                />
              </g>
            );
          })}
        </g>

        {/* Skill ↔ skill: real project/role co-occurrence. */}
        <g className="stroke-accent" fill="none">
          {skillEdges.filter((e) => e.real).map((edge) => {
            const a = skillPos.get(edge.source);
            const b = skillPos.get(edge.target);
            if (!a || !b) return null;
            const lit = isSpotlitEdge(edge.source, edge.target);
            return (
              <g key={`${edge.source}-${edge.target}`}>
                <EdgeHitArea x1={a.x} y1={a.y} x2={b.x} y2={b.y} a={edge.source} b={edge.target} />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth={lit ? LINE_WIDTH * 2 : LINE_WIDTH}                  opacity={edgeOpacity(0.7, edge.source, edge.target)}
                  className="pointer-events-none transition-opacity duration-150"
                />
              </g>
            );
          })}
        </g>

        {/* Skill ↔ skill: curated technology relationships (e.g. React
            powers Next.js) — same muted-ink dashed treatment as a
            category bridge edge, since it's the same kind of claim: a
            known fact about the technologies, not an observed project
            pairing. */}
        <g className="stroke-ink-faint" fill="none">
          {skillEdges.filter((e) => !e.real).map((edge) => {
            const a = skillPos.get(edge.source);
            const b = skillPos.get(edge.target);
            if (!a || !b) return null;
            const lit = isSpotlitEdge(edge.source, edge.target);
            return (
              <g key={`${edge.source}-${edge.target}`}>
                <EdgeHitArea x1={a.x} y1={a.y} x2={b.x} y2={b.y} a={edge.source} b={edge.target} />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  strokeWidth={lit ? LINE_WIDTH * 2 : LINE_WIDTH}                  opacity={edgeOpacity(0.65, edge.source, edge.target)}
                  strokeDasharray="6 6"
                  className="pointer-events-none transition-opacity duration-150"
                />
              </g>
            );
          })}
        </g>

        {/* Root node */}
        <g
          opacity={nodeOpacity("__root__")}
          className="transition-opacity duration-150"
          data-node-id="__root__"
        >
          <circle cx={CENTER} cy={CENTER} r={ROOT_RADIUS} fill="url(#connGraphRoot)" />
          {!zoomedOut && (
            <text
              x={CENTER}
              y={CENTER}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--color-base)] text-[24px] font-bold"
            >
              Skills
            </text>
          )}
        </g>

        {/* Category nodes — a distinctly-colored, larger dot once zoomed
            out (still a fixed size, same as every other dot at this
            tier — only the color marks it as "category" rather than
            "skill"), with no icon, matching the skill leaves' zoomed-out
            treatment: nothing legible at that scale anyway, so showing it
            would just be noise. The name itself only shows on hover, via
            the same tooltip the skill leaves use — free-floating nodes
            don't have a stable "outside" to anchor a permanent label to
            the way the old fixed ring did. */}
        {categoryNodes.map((n) => {
          const CategoryIcon = categoryIcons[n.category.id] ?? CodeBracketsIcon;
          return (
            <g
              key={n.category.id}
              onMouseEnter={() => setHovered({ label: n.category.label, x: n.x, y: n.y })}
              onMouseLeave={() => setHovered(undefined)}
              opacity={nodeOpacity(n.category.id)}
              className="transition-opacity duration-150"
              data-node-id={n.category.id}
            >
              {zoomedOut ? (
                <circle cx={n.x} cy={n.y} r={DOT_RADIUS} className="fill-accent-soft" />
              ) : (
                <>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={CATEGORY_NODE_RADIUS}
                    className="fill-graph-node-bg"
                  />
                  <foreignObject
                    x={n.x - 19}
                    y={n.y - 19}
                    width={38}
                    height={38}
                    className="pointer-events-none overflow-visible"
                  >
                    <div className="flex h-[38px] w-[38px] items-center justify-center text-accent-soft">
                      <CategoryIcon className="h-9 w-9" />
                    </div>
                  </foreignObject>
                </>
              )}
            </g>
          );
        })}

        {/* Skill leaf nodes — full logo tiles when zoomed in; plain dots
            once zoomed out far enough that individual logos wouldn't be
            legible anyway, so the graph reads as a network shape instead
            of a field of illegible tiles. Same dot size as a zoomed-out
            category node, different color only — size marks nothing
            about importance at this tier, color marks what kind of thing
            it is. */}
        {skillNodes.map((n) => (
          <g
            key={n.skill.name}
            onMouseEnter={() => setHovered({ label: n.skill.name, x: n.x, y: n.y })}
            onMouseLeave={() => setHovered(undefined)}
            opacity={nodeOpacity(n.skill.name)}
            className="transition-opacity duration-150"
            data-node-id={n.skill.name}
          >
            {zoomedOut ? (
              <circle cx={n.x} cy={n.y} r={DOT_RADIUS} className="fill-accent" />
            ) : (
              <foreignObject
                x={n.x - SKILL_NODE_SIZE / 2}
                y={n.y - SKILL_NODE_SIZE / 2}
                width={SKILL_NODE_SIZE}
                height={SKILL_NODE_SIZE}
                className="overflow-visible"
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded-2xl p-3 shadow-sm ${
                    isSpotlitNode(n.skill.name) ? "bg-tech-icon-bg-spotlit" : "bg-tech-icon-bg"
                  }`}
                >
                  <TechLogo skill={n.skill} className="h-9 w-9" fallbackTextClassName="text-sm" />
                </div>
              </foreignObject>
            )}
          </g>
        ))}
      </svg>

      {hovered && !zoomedOut && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md border border-line bg-panel-alt px-2 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-sm"
          style={{
            left: `${((hovered.x - viewBox.x) / viewBox.w) * 100}%`,
            top: `${((hovered.y - viewBox.y) / viewBox.h) * 100}%`,
          }}
        >
          {hovered.label.toUpperCase()}
        </span>
      )}

      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-line bg-panel p-1 shadow-lg">
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.3)}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:text-ink"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1.3)}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:text-ink"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setViewBox(defaultViewBox())}
          aria-label="Reset view"
          className="flex h-7 items-center justify-center rounded-md px-2 text-[11px] font-medium text-ink-faint transition-colors hover:text-ink"
        >
          Reset
        </button>
        <div className="mx-0.5 h-5 w-px bg-line" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setLegendOpen((open) => !open)}
          aria-label="What the colors and shapes mean"
          aria-pressed={legendOpen}
          className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold transition-colors ${
            legendOpen ? "bg-accent text-[var(--color-base)]" : "text-ink-faint hover:text-ink"
          }`}
        >
          ?
        </button>
      </div>

      {legendOpen && (
        <div className="absolute right-3 top-14 z-20 w-64 rounded-lg border border-line bg-panel p-3 text-xs shadow-lg">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Legend
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: "linear-gradient(135deg, var(--color-accent-soft), var(--color-accent-deep))" }} />
              <span className="text-ink-soft">Skills — the starting point</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${zoomedOut ? "bg-accent-soft" : "bg-graph-node-bg"}`}
              />
              <span className="text-ink-soft">A category</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 shrink-0 rounded-md ${zoomedOut ? "bg-accent" : "bg-tech-icon-bg"}`}
              />
              <span className="text-ink-soft">A skill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 shrink-0 bg-ink-faint" />
              <span className="text-ink-soft">Root houses this category</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 shrink-0 bg-accent-deep" />
              <span className="text-ink-soft">Category houses this skill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 shrink-0 bg-accent" />
              <span className="text-ink-soft">Skills used together on an actual project or role</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 shrink-0 bg-accent-soft" />
              <span className="text-ink-soft">Categories that relate, via their skills&apos; real connections</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-0.5 w-4 shrink-0"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--color-ink-faint) 0 4px, transparent 4px 8px)" }}
              />
              <span className="text-ink-soft">Inferred — a known relationship, not from project data directly</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
