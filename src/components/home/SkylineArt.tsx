/** Our own simple Doha-style skyline (licence-safe). Decorative only: hidden from screen readers and not clickable. */
export default function SkylineArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 150" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false" className={`pointer-events-none select-none ${className}`}>
      <circle cx="286" cy="46" r="26" className="fill-pink" />
      <g className="fill-blue" opacity="0.18">
        <rect x="0" y="118" width="360" height="32" />
        <path d="M0 118 h28 v-34 h18 v34 h22 v-52 h16 v52 h30 v-26 h20 v26 h26 v-70 h14 v70 h24 v-40 h22 v40 h28 v-22 h22 v22 h30 v-30 h26 v30 H360 v32 H0z" />
      </g>
      <g className="fill-blue">
        <rect x="60" y="64" width="16" height="86" rx="2" />
        <path d="M120 150 V52 l10 -24 l10 24 V150z" />
        <rect x="170" y="38" width="22" height="112" rx="3" />
        <path d="M222 150 V70 q16 -34 32 0 V150z" />
        <rect x="270" y="86" width="26" height="64" rx="3" />
        <rect x="312" y="100" width="22" height="50" rx="2" />
      </g>
      <g className="fill-white" opacity="0.9">
        <rect x="177" y="52" width="8" height="5" rx="1" /><rect x="177" y="68" width="8" height="5" rx="1" /><rect x="177" y="84" width="8" height="5" rx="1" />
        <rect x="276" y="98" width="5" height="5" rx="1" /><rect x="286" y="98" width="5" height="5" rx="1" /><rect x="276" y="112" width="5" height="5" rx="1" /><rect x="286" y="112" width="5" height="5" rx="1" />
      </g>
    </svg>
  );
}
