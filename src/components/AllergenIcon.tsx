/** Renders allergen icons; sesame uses an SVG so it never looks like a doughnut. */

export interface AllergenIconProps {
  id?: string;
  emoji: string;
  className?: string;
  title?: string;
}

function SesameSeedsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      {/* Cluster of sesame seeds */}
      <ellipse cx="22" cy="28" rx="5.5" ry="3.2" transform="rotate(-35 22 28)" fill="#c4a35a" />
      <ellipse cx="34" cy="22" rx="5.5" ry="3.2" transform="rotate(20 34 22)" fill="#d4b56a" />
      <ellipse cx="44" cy="30" rx="5.5" ry="3.2" transform="rotate(-15 44 30)" fill="#b8934a" />
      <ellipse cx="28" cy="38" rx="5.5" ry="3.2" transform="rotate(40 28 38)" fill="#c9a85f" />
      <ellipse cx="40" cy="40" rx="5.5" ry="3.2" transform="rotate(-50 40 40)" fill="#d1b062" />
      <ellipse cx="18" cy="40" rx="4.8" ry="2.8" transform="rotate(10 18 40)" fill="#a88440" />
      <ellipse cx="48" cy="20" rx="4.8" ry="2.8" transform="rotate(-60 48 20)" fill="#c4a35a" />
    </svg>
  );
}

export default function AllergenIcon({ id, emoji, className, title }: AllergenIconProps) {
  if (id === 'sesame') {
    return (
      <span className={className} title={title ?? 'Sesame'} role="img" aria-label="Sesame">
        <SesameSeedsIcon />
      </span>
    );
  }
  return (
    <span className={className} aria-hidden={title ? undefined : true} title={title}>
      {emoji}
    </span>
  );
}
