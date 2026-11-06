/** Always-visible disclosure. An <aside> with a label so screen readers treat it as part of the page structure. */
export default function SimulatedBanner() {
  return (
    <aside
      aria-label="Simulated data notice"
      className="bg-pink-50 px-4 py-2 text-center text-[12px] font-semibold text-ink"
    >
      Simulated demo data. Not affiliated with the brands shown.
    </aside>
  );
}
