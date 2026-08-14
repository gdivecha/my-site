"use client";

import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { TechLogo } from "@/components/TechIcon";
import { CodeBracketsIcon } from "@/components/icons";
import {
  buildCategoryConnections,
  buildSkillConnections,
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
function useHybridLayout(categories: SkillCategory[]) {
  return useMemo(() => {
    const skillEdges = buildSkillConnections();
    const categoryEdges = buildCategoryConnections(skillEdges);

    type NodeId = string;
    const ROOT_ID = "__root__";
    const positions = new Map<NodeId, Point>();
    const radii = new Map<NodeId, number>();

    const allIds: NodeId[] = [ROOT_ID];
    positions.set(ROOT_ID, { x: CENTER, y: CENTER });
    radii.set(ROOT_ID, ROOT_RADIUS);

    categories.forEach((c) => {
      allIds.push(c.id);
      radii.set(c.id, CATEGORY_NODE_RADIUS);
    });
    categories.forEach((c) =>
      c.skills.forEach((s) => {
        allIds.push(s.name);
        radii.set(s.name, SKILL_NODE_SIZE / 2);
      })
    );

    // Deterministic seed (index-based circle — no Math.random, so server
    // and client start from the exact same positions).
    const seedRadius = SIZE * 0.3;
    allIds.forEach((id, i) => {
      if (id === ROOT_ID) return;
      const a = (2 * Math.PI * i) / allIds.length;
      positions.set(id, {
        x: CENTER + seedRadius * Math.cos(a),
        y: CENTER + seedRadius * Math.sin(a),
      });
    });

    type SimEdge = { a: NodeId; b: NodeId; weight: number; distance: number; strength: number };
    const ROOT_CAT_DISTANCE = SIZE * 0.27;
    const ROOT_CAT_STRENGTH = 0.1;
    const CAT_SKILL_DISTANCE = SIZE * 0.085;
    const CAT_SKILL_STRENGTH = 1.2;
    const LINK_DISTANCE = SIZE * 0.32;
    const LINK_STRENGTH = 0.025;

    const simEdges: SimEdge[] = [];
    categories.forEach((c) =>
      simEdges.push({ a: ROOT_ID, b: c.id, weight: 1, distance: ROOT_CAT_DISTANCE, strength: ROOT_CAT_STRENGTH })
    );
    categories.forEach((c) =>
      c.skills.forEach((s) =>
        simEdges.push({ a: c.id, b: s.name, weight: 1, distance: CAT_SKILL_DISTANCE, strength: CAT_SKILL_STRENGTH })
      )
    );
    skillEdges.forEach((e) =>
      simEdges.push({ a: e.source, b: e.target, weight: e.weight, distance: LINK_DISTANCE, strength: LINK_STRENGTH })
    );
    categoryEdges.forEach((e) =>
      simEdges.push({ a: e.source, b: e.target, weight: Math.max(1, e.weight), distance: LINK_DISTANCE, strength: LINK_STRENGTH })
    );

    const CENTER_STRENGTH = 0.02;
    const REPEL_STRENGTH = SIZE * SIZE * 0.02;
    const MAX_STEP = SIZE * 0.02;
    const iterations = 500;

    for (let iter = 0; iter < iterations; iter++) {
      const temperature = 1 - iter / iterations;
      const forces = new Map<NodeId, { fx: number; fy: number }>();
      allIds.forEach((id) => forces.set(id, { fx: 0, fy: 0 }));

      for (let i = 0; i < allIds.length; i++) {
        for (let j = i + 1; j < allIds.length; j++) {
          const idA = allIds[i];
          const idB = allIds[j];
          const a = positions.get(idA)!;
          const b = positions.get(idB)!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = Math.max(1, dx * dx + dy * dy);
          const dist = Math.sqrt(distSq);
          const f = REPEL_STRENGTH / distSq;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          forces.get(idA)!.fx += fx;
          forces.get(idA)!.fy += fy;
          forces.get(idB)!.fx -= fx;
          forces.get(idB)!.fy -= fy;
        }
      }

      for (const edge of simEdges) {
        const a = positions.get(edge.a);
        const b = positions.get(edge.b);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const f = (dist - edge.distance) * edge.strength * edge.weight;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        forces.get(edge.a)!.fx += fx;
        forces.get(edge.a)!.fy += fy;
        forces.get(edge.b)!.fx -= fx;
        forces.get(edge.b)!.fy -= fy;
      }

      for (const id of allIds) {
        const p = positions.get(id)!;
        const f = forces.get(id)!;
        f.fx += (CENTER - p.x) * CENTER_STRENGTH;
        f.fy += (CENTER - p.y) * CENTER_STRENGTH;
      }

      for (const id of allIds) {
        if (id === ROOT_ID) continue; // the one fixed anchor
        const p = positions.get(id)!;
        const f = forces.get(id)!;
        let fx = f.fx * temperature;
        let fy = f.fy * temperature;
        const mag = Math.hypot(fx, fy);
        if (mag > MAX_STEP) {
          fx = (fx / mag) * MAX_STEP;
          fy = (fy / mag) * MAX_STEP;
        }
        p.x += fx;
        p.y += fy;
      }
    }

    // Direct pairwise separation, using each node type's real radius —
    // simulated annealing settles close but rarely eliminates every last
    // near-overlap on its own.
    for (let pass = 0; pass < 100; pass++) {
      let moved = false;
      for (let i = 0; i < allIds.length; i++) {
        for (let j = i + 1; j < allIds.length; j++) {
          const idA = allIds[i];
          const idB = allIds[j];
          const a = positions.get(idA)!;
          const b = positions.get(idB)!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minSeparation = radii.get(idA)! + radii.get(idB)! + 18;
          if (dist > 0 && dist < minSeparation) {
            const push = (minSeparation - dist) / 2;
            const ux = dx / dist;
            const uy = dy / dist;
            if (idA !== ROOT_ID) {
              a.x += ux * push;
              a.y += uy * push;
            }
            if (idB !== ROOT_ID) {
              b.x -= ux * push;
              b.y -= uy * push;
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    allIds.forEach((id) => {
      const p = positions.get(id)!;
      p.x = round(p.x);
      p.y = round(p.y);
    });

    const categoryNodes: CategoryNode[] = categories.map((category) => ({
      category,
      ...positions.get(category.id)!,
    }));
    const skillNodes: SkillNode[] = categories.flatMap((c) =>
      c.skills.map((skill) => ({
        skill,
        categoryId: c.id,
        ...positions.get(skill.name)!,
      }))
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

  const categoryPos = new Map(categoryNodes.map((n) => [n.category.id, n]));
  const skillPos = new Map(skillNodes.map((n) => [n.skill.name, n]));
  const zoomedOut = viewBox.w > LOD_VIEW_THRESHOLD;

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

  function handleWheel(e: WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const fx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const fy = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    zoomBy(e.deltaY > 0 ? 1.08 : 1 / 1.08, { x: fx, y: fy });
  }

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, startViewBox: viewBox };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || !svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * drag.startViewBox.w;
    const dy = ((e.clientY - drag.startY) / rect.height) * drag.startViewBox.h;
    setViewBox({ ...drag.startViewBox, x: drag.startViewBox.x - dx, y: drag.startViewBox.y - dy });
  }

  function handlePointerUp(e: PointerEvent<SVGSVGElement>) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-base">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="h-[560px] w-full cursor-grab touch-none active:cursor-grabbing md:h-[680px]"
        role="img"
        aria-label="Skills grouped by category, and connected to each other by the projects and roles that used them together — pannable and zoomable"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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

        {/* Five line types, five colors, all drawn from the site's
            existing tokens (no new hues invented) so each kind of
            relationship reads apart from the others at a glance — see
            the legend button for what each one means. */}

        {/* Root → category spokes: the graph's starting point and the
            structure everything else hangs off of. */}
        <g className="stroke-ink-faint">
          {categoryNodes.map((c) => (
            <line
              key={c.category.id}
              x1={CENTER}
              y1={CENTER}
              x2={c.x}
              y2={c.y}
              strokeWidth={LINE_WIDTH}
              opacity={0.4}
            />
          ))}
        </g>

        {/* Category ↔ category: how the categories themselves relate,
            derived from real skill-to-skill edges crossing category
            lines. */}
        <g className="stroke-accent-soft" fill="none">
          {categoryEdges.filter((e) => e.real).map((edge) => {
            const a = categoryPos.get(edge.source);
            const b = categoryPos.get(edge.target);
            if (!a || !b) return null;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={LINE_WIDTH}
                opacity={0.5}
              />
            );
          })}
        </g>

        {/* Bridge edges: a category with zero real cross-links of its
            own, linked to the graph's most-connected category so it
            isn't a stray island. A distinct color (not just faint/dashed
            purple) since it's a genuinely different kind of claim —
            inferred, not observed. */}
        <g className="stroke-accent-contact" fill="none">
          {categoryEdges.filter((e) => !e.real).map((edge) => {
            const a = categoryPos.get(edge.source);
            const b = categoryPos.get(edge.target);
            if (!a || !b) return null;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={LINE_WIDTH}
                opacity={0.4}
                strokeDasharray="10 10"
              />
            );
          })}
        </g>

        {/* Category → skill: how each category houses its skills. */}
        <g className="stroke-accent-deep" fill="none">
          {skillNodes.map((n) => {
            const home = categoryPos.get(n.categoryId);
            if (!home) return null;
            return (
              <line
                key={`house-${n.skill.name}`}
                x1={home.x}
                y1={home.y}
                x2={n.x}
                y2={n.y}
                strokeWidth={LINE_WIDTH}
                opacity={0.3}
              />
            );
          })}
        </g>

        {/* Skill ↔ skill: real project/role co-occurrence only. */}
        <g className="stroke-accent" fill="none">
          {skillEdges.map((edge) => {
            const a = skillPos.get(edge.source);
            const b = skillPos.get(edge.target);
            if (!a || !b) return null;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={LINE_WIDTH}
                opacity={0.55}
              />
            );
          })}
        </g>

        {/* Root node */}
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
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-tech-icon-bg p-3 shadow-sm">
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
              <span className="h-3 w-3 shrink-0 rounded-full bg-graph-node-bg" />
              <span className="text-ink-soft">A category</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-md bg-tech-icon-bg" />
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
                className="h-0.5 w-4 shrink-0 bg-accent-contact"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--color-accent-contact) 0 4px, transparent 4px 8px)" }}
              />
              <span className="text-ink-soft">Inferred — no direct data, linked to stay connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
