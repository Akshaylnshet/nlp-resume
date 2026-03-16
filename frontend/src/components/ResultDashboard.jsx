import React from 'react';
import ScoreCircle from './ScoreCircle';
import SkillBadge from './SkillBadge';

function SectionHeader({ colour, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colour, flexShrink: 0 }} />
      <p className="section-label" style={{ color: colour }}>{label}</p>
    </div>
  );
}

function ProgressStat({ label, pct, colour }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(148,163,184,0.8)' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colour }}>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colour}88, ${colour})` }}
        />
      </div>
    </div>
  );
}

function ResetBtn({ onClick, label = 'New Analysis', style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        fontSize: '0.75rem', fontWeight: 600,
        padding: '0.5rem 1rem', borderRadius: '0.75rem',
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)',
        color: '#a5b4fc', cursor: 'pointer', transition: 'transform 0.2s',
        ...style,
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseOut={(e)  => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {label}
    </button>
  );
}

export default function ResultDashboard({ result, onReset }) {
  const {
    similarity_score:         sim,
    keyword_match_score:      kw,
    matched_skills:           matched,
    missing_skills:           missing,
    improvement_suggestions:  suggestions,
  } = result;

  const grade =
    sim >= 75 ? { label: 'Excellent Match', colour: '#34d399', emoji: '🎯' } :
    sim >= 55 ? { label: 'Good Match',      colour: '#fbbf24', emoji: '👍' } :
    sim >= 35 ? { label: 'Fair Match',      colour: '#fb923c', emoji: '🔧' } :
               { label: 'Weak Match',        colour: '#fb7185', emoji: '⚠️' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Header ── */}
      <div className="anim-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{grade.emoji}</span>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: grade.colour }}>{grade.label}</h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>
            Analysis complete · Scroll down to review all insights
          </p>
        </div>
        <ResetBtn onClick={onReset} />
      </div>

      {/* ── Score Panel ── */}
      <div className="glass anim-slide-up delay-1" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '2rem',
        }}>
          <ScoreCircle score={sim} label="Overall Match"  size={152} />
          <div className="v-divider" style={{ display: 'none' }} />
          <ScoreCircle score={kw}  label="Keyword Match"  size={152} />

          {/* Stat counters */}
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{matched.length}</p>
              <p className="section-label" style={{ marginTop: '0.35rem' }}>Matched</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fb7185', lineHeight: 1 }}>{missing.length}</p>
              <p className="section-label" style={{ marginTop: '0.35rem' }}>Missing</p>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <ProgressStat label="Overall Match Score" pct={sim} colour="#818cf8" />
          <ProgressStat label="Keyword Alignment"   pct={kw}  colour="#22d3ee" />
        </div>
      </div>

      {/* ── Skills Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
        {/* Matched */}
        <div className="glass anim-slide-up delay-2" style={{ padding: '1.25rem' }}>
          <SectionHeader colour="#34d399" label={`Matched Skills · ${matched.length}`} />
          {matched.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {matched.map((s, i) => <SkillBadge key={s} skill={s} variant="matched" delay={i * 35} />)}
            </div>
          ) : (
            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--c-muted)' }}>No skills matched.</p>
          )}
        </div>

        {/* Missing */}
        <div className="glass anim-slide-up delay-3" style={{ padding: '1.25rem' }}>
          <SectionHeader colour="#fb7185" label={`Missing Skills · ${missing.length}`} />
          {missing.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {missing.map((s, i) => <SkillBadge key={s} skill={s} variant="missing" delay={i * 35} />)}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#34d399' }}>🎉 All required skills present!</p>
          )}
        </div>
      </div>

      {/* ── Suggestions ── */}
      <div className="glass anim-slide-up delay-4" style={{ padding: '1.25rem' }}>
        <SectionHeader colour="#a5b4fc" label="Improvement Suggestions" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-item" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="suggestion-num">{i + 1}</span>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'rgba(203,213,225,0.9)' }}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="glass anim-slide-up delay-5" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Want a stronger match?</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--c-muted)' }}>
            Incorporate the missing skills and re-run the analysis.
          </p>
        </div>
        <button className="btn-main" onClick={onReset} style={{ width: 'auto', padding: '0.75rem 1.75rem' }}>
          Analyze Again
        </button>
      </div>
    </div>
  );
}
