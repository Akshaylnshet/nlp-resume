import React, { useCallback, useRef, useState } from 'react';

const SZ = (s) => ({ width: s, height: s, flexShrink: 0 });

export default function UploadForm({ onAnalyze, isLoading }) {
  const [file, setFile]         = useState(null);
  const [jd, setJd]             = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const accept = (f) => {
    if (f?.type === 'application/pdf') setFile(f);
    else alert('Please upload a PDF file.');
  };

  const onDrop      = useCallback((e) => { e.preventDefault(); setDragOver(false); accept(e.dataTransfer.files[0]); }, []);
  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onSubmit    = (e) => { e.preventDefault(); if (file && jd.trim()) onAnalyze(file, jd); };

  const ready = file && jd.trim().length > 20 && !isLoading;

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Drop Zone ── */}
      <div>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Resume · PDF only</p>
        <div
          className={`drop-zone${dragOver ? ' active' : ''}`}
          style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => inputRef.current.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => accept(e.target.files[0])} />

          {file ? (
            <div className="anim-scale-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <svg style={SZ(28)} fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#6ee7b7' }}>{file.name}</p>
                <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--c-muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to replace
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div className="drop-icon-wrap">
                <svg style={SZ(28)} fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(226,232,240,0.85)' }}>Drop your resume here</p>
                <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--c-muted)' }}>
                  or <span style={{ color: '#a5b4fc' }}>browse files</span> · PDF · Max 10 MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Job Description ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <p className="section-label">Job Description</p>
          <span style={{ fontSize: '0.75rem', color: jd.length > 20 ? 'var(--c-muted)' : '#fb7185' }}>
            {jd.length} / 5000
          </span>
        </div>
        <textarea
          className="jd-textarea"
          placeholder="Paste the full job description here — include required skills, responsibilities, and preferred qualifications for the best match accuracy…"
          value={jd}
          maxLength={5000}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>

      {/* ── Tips ── */}
      {(!file || jd.length < 20) && (
        <div className="anim-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            !file && '📄 Upload a text-based (not scanned) PDF',
            jd.length < 20 && '✏️ Paste at least a few sentences of JD',
          ].filter(Boolean).map((tip) => (
            <span key={tip} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', color: '#fde68a' }}>
              {tip}
            </span>
          ))}
        </div>
      )}

      {/* ── Submit ── */}
      <button type="submit" className="btn-main" disabled={!ready}>
        {isLoading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <span className="spinner-ring" style={{ width: 20, height: 20, borderWidth: 2 }} />
            Analyzing…
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}>
            <svg style={SZ(20)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze Resume
          </span>
        )}
      </button>
    </form>
  );
}
