import React from 'react';

const COLOURS = {
  high:   { stroke: '#34d399', glow: 'rgba(52,211,153,0.35)',  text: '#34d399'  },
  mid:    { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.35)',  text: '#fbbf24'  },
  low:    { stroke: '#fb7185', glow: 'rgba(251,113,133,0.35)', text: '#fb7185'  },
};

export default function ScoreCircle({ score = 0, label = 'Score', size = 168 }) {
  const pct     = Math.min(Math.max(Math.round(score), 0), 100);
  const R       = 52;
  const circ    = 2 * Math.PI * R;
  const offset  = circ - (pct / 100) * circ;
  const col     = pct >= 68 ? COLOURS.high : pct >= 42 ? COLOURS.mid : COLOURS.low;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow halo */}
        <div
          className="absolute inset-4 rounded-full"
          style={{ boxShadow: `0 0 36px 6px ${col.glow}`, opacity: 0.5, transition: 'box-shadow 1s ease' }}
        />

        <svg width={size} height={size} viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="7"
          />
          {/* Tick marks */}
          {Array.from({ length: 40 }, (_, i) => {
            const angle = (i / 40) * 2 * Math.PI - Math.PI / 2;
            const inner = R + 5; const outer = R + 8;
            return (
              <line
                key={i}
                x1={60 + inner * Math.cos(angle)} y1={60 + inner * Math.sin(angle)}
                x2={60 + outer * Math.cos(angle)} y2={60 + outer * Math.sin(angle)}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1"
              />
            );
          })}
          {/* Progress arc */}
          <circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke={col.stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="score-svg-arc"
            style={{ filter: `drop-shadow(0 0 8px ${col.stroke})` }}
          />
        </svg>

        {/* Centre value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold leading-none" style={{ fontSize: '1.9rem', color: col.text }}>
            {pct}
            <span style={{ fontSize: '1rem', fontWeight: 400, color: col.text, opacity: 0.7 }}>%</span>
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="section-label tracking-wider">{label}</span>
    </div>
  );
}
