import React, { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ─────────── Feature cards data ─────────── */
const FEATURES = [
  { emoji: '⚡', colour: '#fbbf24', bg: 'rgba(251,191,36,0.2)',  title: 'Instant Analysis',  desc: 'Get results in seconds' },
  { emoji: '🎯', colour: '#34d399', bg: 'rgba(52,211,153,0.2)',  title: 'ATS Optimization',  desc: 'Beat applicant tracking systems' },
  { emoji: '🤖', colour: '#60a5fa', bg: 'rgba(96,165,250,0.2)',  title: 'AI Feedback',        desc: 'Personalised suggestions' },
  { emoji: '✦',  colour: '#f472b6', bg: 'rgba(244,114,182,0.2)', title: 'Smart Matching',     desc: 'Job compatibility scoring' },
];

/* ─────────── Tiny helpers ─────────── */
const SZ = (n) => ({ width: n, height: n, flexShrink: 0 });

function ScorePill({ value, label, colour, bg }) {
  const pct = Math.min(Math.max(Math.round(value), 0), 100);
  return (
    <div className="score-box" style={{ background: bg }}>
      <div className="score-value" style={{ color: colour }}>{pct}<span style={{ fontSize: '1rem', fontWeight: 500 }}>%</span></div>
      <div className="prog-track" style={{ marginTop: '0.4rem' }}>
        <div className="prog-fill" style={{ width: `${pct}%`, background: colour }} />
      </div>
      <div className="score-label" style={{ color: colour }}>{label}</div>
    </div>
  );
}

/* ─────────── Upload Form Panel ─────────── */
function AnalyzePanel({ onResult }) {
  const [file, setFile]     = useState(null);
  const [jd, setJd]         = useState('');
  const [drag, setDrag]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const inputRef = React.useRef(null);

  const accept = (f) => {
    if (f?.type === 'application/pdf') { setFile(f); setError(''); }
    else setError('Please upload a PDF file.');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || jd.trim().length < 10) return;
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('resume', file);
    fd.append('job_description', jd);
    try {
      const { data } = await axios.post(`${API}/analyze`, fd, { timeout: 90000 });
      onResult(data);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const ready = file && jd.trim().length >= 10 && !loading;

  return (
    <form onSubmit={submit}>
      {/* Avatar + heading */}
      <div className="avatar-icon">📄</div>
      <h2 className="card-title">Analyze Resume</h2>
      <p className="card-subtitle">Upload your resume and paste a job description</p>

      {error && (
        <div className="error-box">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`drop-zone-card${drag ? ' active' : ''}${file ? ' success-zone' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files[0]); }}
      >
        <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
          onChange={(e) => accept(e.target.files[0])} />
        <div className="dz-icon">{file ? '✅' : '📤'}</div>
        {file ? (
          <>
            <div className="dz-text" style={{ color: '#059669' }}>{file.name}</div>
            <div className="dz-hint">{(file.size / 1024).toFixed(1)} KB · Click to replace</div>
          </>
        ) : (
          <>
            <div className="dz-text">Drop your resume here</div>
            <div className="dz-hint">or click to browse · PDF only · Max 10 MB</div>
          </>
        )}
      </div>

      {/* Job description */}
      <div className="field">
        <label>Job Description</label>
        <textarea
          className="field-input"
          placeholder="Paste the full job description — include required skills, responsibilities and qualifications…"
          value={jd}
          maxLength={5000}
          onChange={(e) => setJd(e.target.value)}
        />
        <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.2rem' }}>
          {jd.length} / 5000
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={!ready}>
        {loading ? (
          <>
            <span className="spin-ring" style={{ width: 18, height: 18 }} />
            Analyzing…
          </>
        ) : (
          <>🚀 Analyze Resume</>
        )}
      </button>

      <div className="card-footer" style={{ marginTop: '0.875rem' }}>
        <a href={`${API}/docs`} target="_blank" rel="noreferrer">
          View API Docs ↗
        </a>
      </div>
    </form>
  );
}

/* ─────────── Results Panel ─────────── */
function ResultPanel({ result, onReset }) {
  const {
    similarity_score: sim,
    keyword_match_score: kw,
    matched_skills: matched,
    missing_skills: missing,
    improvement_suggestions: suggestions,
  } = result;

  const grade =
    sim >= 75 ? '🎯 Excellent Match!' :
    sim >= 55 ? '👍 Good Match'       :
    sim >= 35 ? '🔧 Fair Match'       :
               '⚠️ Weak Match';

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div className="avatar-icon" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>✦</div>
        <h2 className="card-title">{grade}</h2>
        <p className="card-subtitle">Scroll to view full analysis</p>
      </div>

      {/* Score boxes */}
      <div className="result-score-row fade-up">
        <ScorePill value={sim} label="Overall Match"  colour="#6366f1" bg="#ede9fe" />
        <ScorePill value={kw}  label="Keyword Match"  colour="#ec4899" bg="#fce7f3" />
      </div>

      {/* Matched skills */}
      <p className="skill-section-title fade-up d1">✓ Matched Skills ({matched.length})</p>
      <div className="skill-tags fade-up d1">
        {matched.length > 0
          ? matched.map((s) => <span key={s} className="tag-green">{s}</span>)
          : <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>None detected</span>}
      </div>

      {/* Missing skills */}
      <p className="skill-section-title fade-up d2">✕ Missing Skills ({missing.length})</p>
      <div className="skill-tags fade-up d2">
        {missing.length > 0
          ? missing.map((s) => <span key={s} className="tag-red">{s}</span>)
          : <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>🎉 All skills present!</span>}
      </div>

      {/* Suggestions */}
      <p className="skill-section-title fade-up d3">💡 Suggestions</p>
      <div className="fade-up d3">
        {suggestions.map((s, i) => (
          <div key={i} className="suggestion-row">
            <div className="sug-num">{i + 1}</div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.55, color: '#374151' }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button className="btn-primary" onClick={onReset} style={{ marginTop: '0.75rem' }}>
        🔄 Analyze Another Resume
      </button>
    </div>
  );
}

/* ─────────── Root App ─────────── */
export default function App() {
  const [tab, setTab]       = useState('analyze'); // 'analyze' | 'about'
  const [result, setResult] = useState(null);

  return (
    <div className="page">
      {/* Decorative blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ═══ LEFT PANEL ═══ */}
      <div className="left-panel">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg style={SZ(20)} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="brand-name">ResumeAI</span>
        </div>

        {/* Hero text */}
        <div className="hero-label fade-up">
          <span>⊙</span>
          <span>AI-Powered Career Tool</span>
        </div>

        <h1 className="hero-title fade-up d1">
          Smart Resume<br />Analyzer
        </h1>

        <p className="hero-desc fade-up d2">
          Transform your career with AI-powered resume analysis. Get instant ATS scores,
          job match insights, and personalized feedback to land your dream job.
        </p>

        {/* Feature cards */}
        <div className="features-grid">
          {FEATURES.map(({ emoji, colour, bg, title, desc }, i) => (
            <div key={title} className={`feature-card fade-up d${i + 2}`}>
              <div className="feature-card-icon" style={{ background: bg }}>
                <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
              </div>
              <div className="feature-card-title">{title}</div>
              <div className="feature-card-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="right-panel">
        <div className="auth-card">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn${tab === 'analyze' ? ' active' : ''}`}
              onClick={() => { setTab('analyze'); setResult(null); }}
            >
              Analyze
            </button>
            <button
              className={`tab-btn${tab === 'about' ? ' active' : ''}`}
              onClick={() => setTab('about')}
            >
              How It Works
            </button>
          </div>

          {/* Tab content */}
          {tab === 'analyze' && !result && (
            <AnalyzePanel onResult={setResult} />
          )}

          {tab === 'analyze' && result && (
            <ResultPanel result={result} onReset={() => setResult(null)} />
          )}

          {tab === 'about' && (
            <div>
              <div className="avatar-icon" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>🧠</div>
              <h2 className="card-title">How It Works</h2>
              <p className="card-subtitle">Three simple steps to career success</p>

              {[
                { n: '1', icon: '📄', title: 'Upload Resume', desc: 'Drop your PDF resume into the analyzer. Works best with text-based PDFs (not scanned images).' },
                { n: '2', icon: '📝', title: 'Paste Job Description', desc: 'Copy the full JD including required skills, responsibilities, and preferred qualifications.' },
                { n: '3', icon: '🚀', title: 'Get AI Insights', desc: 'Receive a detailed match score, skill gap analysis, and ATS-optimisation suggestions instantly.' },
              ].map(({ n, icon, title, desc }) => (
                <div key={n} style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.125rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '0.75rem', background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '0.2rem' }}>
                      Step {n} · {title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}

              <button
                className="btn-primary"
                onClick={() => setTab('analyze')}
                style={{ marginTop: '0.25rem' }}
              >
                🚀 Start Analyzing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
