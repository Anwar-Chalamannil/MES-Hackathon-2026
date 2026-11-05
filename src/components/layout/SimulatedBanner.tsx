/** Always-visible disclosure. An <aside> with a label so screen readers treat it as part of the page structure. */
export default function SimulatedBanner() {
  return (
    <aside
      aria-label="Simulated data notice"
      className="bg-brand-soft px-4 py-2 text-center text-[13px] font-semibold text-brand"
    >
      Simulated data: every price and offer here is an example.
    </aside>
  );
}
