import Image from "next/image";
import { PageHeading } from "@/components/PageHeading";
import { Pill } from "@/components/Pill";
import { profile } from "@/lib/data/profile";

/** Title, photo, and info pills for Home's intro (see .home-intro-grid,
 * globals.css, for how these get reassigned to different areas between
 * breakpoints). Below sm, the photo and pills share a single (non-
 * spanning) row; the photo's column is a fixed 5/9 share of that row's
 * width (see .home-intro-grid's grid-template-columns) and the photo
 * fills it width-first (w-full), with aspect-ratio deriving its HEIGHT
 * from that already-definite width — deliberately the direction that
 * doesn't risk a circular sizing dependency (a WIDTH coming from a grid
 * track is settled before layout ever needs the photo's height, unlike
 * an earlier version that derived the photo's height from a measurement
 * of the row itself, which the photo's own size was simultaneously
 * feeding into). The pills column and photo both then just report their
 * own independent natural heights, and align-items:end on the grid
 * bottom-aligns whichever is shorter against the taller one — standard,
 * safe CSS grid sizing, nothing measured or synced by hand. sm+ keeps
 * its own established relationship instead: the photo has an explicit
 * width and the pills conform to ITS height (see the pills column's own
 * margin-bottom correction below). */
export function IntroHero() {
  return (
    <>
      <div style={{ gridArea: "title" }}>
        <PageHeading eyebrow="Home">Hi there...</PageHeading>
      </div>

      {/* A true blob outline (not the standard rounded-rect used
          everywhere else) — an asymmetric, organic egg/potato shape
          built from only outward-bulging curves (no concave pinches or
          notches — those read as "cut off" rather than natural), via
          clip-path rather than border-radius, which can only produce 4
          elliptical corners — so the one portrait on the whole site
          reads as deliberately different rather than another boxed
          image. */}
      <div
        // w-full: fills its grid column, which is already a fixed 5/9
        // share of the row (see .home-intro-grid) — aspect-[4/5] then
        // derives the photo's height from that definite width, not the
        // other way around, which is what keeps this safe from the
        // circular-sizing bug class an earlier version hit (see this
        // component's top-level comment). sm+ overrides back to an
        // explicit width instead, its own established mechanism.
        className="relative aspect-[4/5] w-full shrink-0 bg-panel sm:w-[var(--home-photo-size)] sm:self-end"
        style={{
          gridArea: "photo",
          // Rotated ~7deg clockwise around its own centroid in true
          // (non-square) aspect space — rotating the raw percentage
          // coordinates directly would skew the shape, since 1% of
          // width != 1% of height at a 4:5 box. See the marginBottom
          // note below: rotating shifted the shape's bottom-most point
          // too, from 2.00% to 2.35% of the box's height.
          clipPath:
            "polygon(96.80% 62.90%, 95.82% 65.96%, 94.67% 68.96%, 93.30% 71.87%, 91.75% 74.68%, 89.99% 77.39%, 88.02% 79.97%, 85.85% 82.41%, 83.50% 84.70%, 80.96% 86.82%, 78.26% 88.74%, 75.42% 90.47%, 72.46% 92.01%, 69.41% 93.35%, 66.29% 94.48%, 63.11% 95.43%, 59.91% 96.19%, 56.69% 96.78%, 53.45% 97.22%, 50.23% 97.50%, 47.01% 97.65%, 43.80% 97.65%, 40.60% 97.53%, 37.41% 97.28%, 34.23% 96.89%, 31.07% 96.34%, 27.94% 95.65%, 24.85% 94.78%, 21.81% 93.74%, 18.86% 92.49%, 16.02% 91.05%, 13.32% 89.39%, 10.79% 87.53%, 8.48% 85.47%, 6.41% 83.21%, 4.61% 80.79%, 3.11% 78.22%, 1.93% 75.54%, 1.08% 72.77%, 0.53% 69.96%, 0.31% 67.14%, 0.37% 64.32%, 0.70% 61.55%, 1.25% 58.85%, 2.00% 56.22%, 2.88% 53.68%, 3.89% 51.21%, 4.97% 48.80%, 6.09% 46.47%, 7.25% 44.14%, 8.41% 41.84%, 9.58% 39.50%, 10.78% 37.12%, 12.02% 34.69%, 13.34% 32.17%, 14.76% 29.56%, 16.34% 26.88%, 18.11% 24.14%, 20.12% 21.37%, 22.40% 18.60%, 24.97% 15.88%, 27.87% 13.26%, 31.09% 10.82%, 34.62% 8.58%, 38.44% 6.64%, 42.53% 5.03%, 46.83% 3.81%, 51.27% 3.02%, 55.81% 2.68%, 60.36% 2.81%, 64.86% 3.42%, 69.24% 4.50%, 73.44% 6.02%, 77.38% 7.96%, 81.05% 10.26%, 84.37% 12.90%, 87.35% 15.80%, 89.96% 18.93%, 92.20% 22.23%, 94.08% 25.64%, 95.61% 29.13%, 96.81% 32.66%, 97.72% 36.19%, 98.35% 39.71%, 98.73% 43.19%, 98.89% 46.62%, 98.85% 50.00%, 98.61% 53.32%, 98.18% 56.57%, 97.58% 59.76%)",
        }}
      >
        <Image
          src="/profile.jpg"
          alt={profile.name}
          fill
          sizes="260px"
          className="object-cover"
          priority
        />
      </div>

      {/* Mobile uses short fixed abbreviations (below) to stay compact —
          the pills column is a fixed 4/9 share of the row (see
          .home-intro-grid), narrower than the photo's own 5/9, so there's
          less horizontal room to work with than before. The blob's
          outline pulls its visible bottom edge in from the box's true
          bottom edge slightly — ~2.35% of its own height post-rotation,
          2.94% of the photo's width, since height = width × 5/4 — so the
          sm+ margin-bottom correction keeps the pills' bottom aligned
          with the blob's actual visible bottom there. Mobile doesn't
          need that correction: align-items:end on the grid already
          bottom-aligns this column against however tall the photo
          renders, with no shared-edge math required.

          flex-col items-end, not a full-width grid column — forcing
          every pill to the SAME width (matching the column, regardless
          of how short its own label is) was tried first and looked
          wrong in practice: a big uniform pill shape with its actual
          content squeezed hard against one edge, leaving a large bare
          gap that varied per label rather than reading as deliberate.
          Letting each pill size to its own content and right-align as a
          natural stack (items-end) is the more legible "chip list"
          shape — variable widths, clean edges, nothing to visually
          justify. sm+ is unaffected either way (already content-sized
          via max-content, right-aligned there too). */}
      {/* order-1..4 (mobile only, reset via sm:order-none): roughly
          shortest label to longest, top to bottom, so the varying pill
          widths this right-aligned stack produces read as a deliberate
          staircase instead of a random jumble of lengths — with
          Available pulled above 2+ yrs exp specifically (both are the
          same length, so the strict-by-length order didn't dictate
          either way). DOM order itself stays the original logical
          sequence (experience, education, location, availability) —
          order is purely visual, so this doesn't affect reading/tab
          order, and desktop's own (already-settled) sequence is
          completely untouched. */}
      <div
        style={{ gridArea: "pills" }}
        // sm:justify-self-start + sm:items-start: two real regressions
        // caught after the fact, both from dropping the old grid-based
        // classes when this switched to flex-col for mobile. On desktop
        // the "pills" grid area is the wide minmax(0,1fr) flexible
        // track (see .home-intro-grid's sm+ media query) — without
        // justify-self-start, this wrapper div defaulted to grid's own
        // stretch behavior and filled that entire track, pushing it
        // over to the far right of the page instead of hugging the
        // photo; without items-start, the pills inside would also still
        // right-align themselves within that wrapper via the mobile-only
        // items-end below, even once the wrapper itself was positioned
        // correctly again.
        className="flex flex-col items-end gap-2 sm:items-start sm:justify-self-start sm:gap-2.5 sm:mb-[calc(clamp(180px,24vh,260px)*0.0294)]"
      >
        <Pill icon={<span aria-hidden="true">💼</span>} className="order-3 sm:order-none">
          <span className="sm:hidden">2+ ys exp</span>
          <span className="hidden sm:inline">
            2+ years of experience in SWE
          </span>
        </Pill>
        <Pill icon={<span aria-hidden="true">🎓</span>} className="order-1 sm:order-none">
          <span className="sm:hidden">T.M.U.</span>
          <span className="hidden sm:inline">{profile.education}</span>
        </Pill>
        <Pill icon={<span aria-hidden="true">📍</span>} className="order-4 sm:order-none">
          <span className="sm:hidden">Toronto, ON, CA</span>
          <span className="hidden sm:inline">{profile.location}</span>
        </Pill>
        <Pill icon={<span aria-hidden="true">🟢</span>} className="order-2 sm:order-none">
          <span className="sm:hidden">Available</span>
          <span className="hidden sm:inline">
            Available for opportunities
          </span>
        </Pill>
      </div>
    </>
  );
}
