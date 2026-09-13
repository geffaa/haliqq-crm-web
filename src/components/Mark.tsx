// The Haliqq logo mark, ported from the prototype's <Mark> component.
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 20 12" fill="none" aria-hidden="true">
      <path
        d="M2.4 2c0 4 1.4 6.2 3.3 6.2 1.6 0 2.5-1.4 2.5-3.8 0 3 1.2 4.8 3 4.8 2.3 0 3.8-2.5 3.8-6.3"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
