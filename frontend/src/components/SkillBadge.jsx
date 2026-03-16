import React from 'react';

export default function SkillBadge({ skill, variant = 'matched', delay = 0 }) {
  return (
    <span
      className={`badge ${variant === 'matched' ? 'badge-matched' : 'badge-missing'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {variant === 'matched' ? (
        <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="none">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )}
      {skill}
    </span>
  );
}
