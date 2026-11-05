/** Always-visible disclosure. An <aside> with a label so screen readers treat it as part of the page structure. */
export default function SimulatedBanner() {
  return (
    <aside
      aria-label="Simulated data notice"
      className="bg-brand-soft text-brand text-[13px] font-semibold px-4 py-2 text-center"
    >
      Simulated data: prices, fees, availability and vouchers are examples, not live offers.
    </aside>
  );
}
