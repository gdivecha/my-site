"use client";

import { useEffect, useMemo, useState } from "react";
import { TechLogo } from "@/components/TechIcon";
import { CodeBracketsIcon } from "@/components/icons";
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
      {/* max-w-[min(48rem,72vh)]: the viewBox is a perfect square, so an
          equivalent max-height is just the same value in width terms —
          this is what actually keeps the whole graph within one
          viewport (72vh leaves room for the heading/toggle row above),
          rather than the old flat max-w-3xl, which had no awareness of
          how tall the square it produces actually is. */}
      <div className="relative mx-auto mt-12 w-full max-w-[min(48rem,72vh)]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full"
          role="img"
          aria-label="Skills grouped by category, shown as a network graph you can spin by scrolling over it"
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
            instead of a ring of text sweeping past at every angle. */}
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
        {skillNodes.map((n) => (
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
        ))}
      </svg>

      {hovered && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md border border-line bg-panel-alt px-2 py-1 text-[11px] font-semibold tracking-wide text-ink shadow-sm"
          style={{
            left: `${(hovered.x / SIZE) * 100}%`,
            top: `${(hovered.y / SIZE) * 100}%`,
          }}
        >
          {hovered.label.toUpperCase()}
        </span>
      )}
      </div>
    </div>
  );
}
