export function NodeDocIcon({ color = "#66C0DC", cx, cy, r }) {
  const size = r * 0.42;
  const x = cx - size * 0.75;
  const y = cy - size;
  const width = size * 1.5;
  const height = size * 1.9;

  return (
    <g>
      <rect
        fill={color}
        height={height}
        opacity="0.14"
        rx={size * 0.18}
        width={width}
        x={x}
        y={y}
      />
      {[0.28, 0.5, 0.72].map((factor, index) => (
        <line
          key={factor}
          opacity="0.72"
          stroke={color}
          strokeWidth="1.35"
          x1={x + width * 0.18}
          x2={x + width * (index < 2 ? 0.82 : 0.58)}
          y1={y + height * factor}
          y2={y + height * factor}
        />
      ))}
    </g>
  );
}

export function LockBadge({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle fill="white" opacity="0.95" r="8" />
      <path
        d="M -2.2 -1.5 v -2.8 q 0 -3 4.4 0 v 2.8"
        fill="none"
        stroke="#9B9BA8"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <rect fill="#9B9BA8" height="5.5" rx="1.2" width="7" x="-3.5" y="-1.5" />
    </g>
  );
}

export function FilterIcon() {
  return (
    <svg height="14" viewBox="0 0 14 14" width="14">
      <line stroke="#555" strokeWidth="1.5" x1="1" x2="13" y1="4" y2="4" />
      <line stroke="#555" strokeWidth="1.5" x1="1" x2="13" y1="7" y2="7" />
      <line stroke="#555" strokeWidth="1.5" x1="1" x2="13" y1="10" y2="10" />
    </svg>
  );
}

export function MiniConnectionIcon({ dashed = false }) {
  return (
    <svg height="13" viewBox="0 0 13 13" width="13">
      {dashed ? (
        <path
          d="M2 7 Q6.5 3 11 7"
          fill="none"
          stroke="#888"
          strokeDasharray="2,1.5"
          strokeWidth="1.2"
        />
      ) : (
        <>
          <circle cx="2.5" cy="6.5" fill="none" r="1.8" stroke="#888" strokeWidth="1.1" />
          <circle cx="10.5" cy="6.5" fill="none" r="1.8" stroke="#888" strokeWidth="1.1" />
          <line stroke="#888" strokeWidth="1.1" x1="4.3" x2="8.7" y1="6.5" y2="6.5" />
        </>
      )}
    </svg>
  );
}
