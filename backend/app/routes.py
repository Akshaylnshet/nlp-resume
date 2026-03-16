"""
routes.py
FastAPI router – exposes the POST /analyze endpoint.
"""

from __future__ import annotations

import io
from typing import Optional

import pdfplumber
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from .models import AnalysisResult
from .nlp import (
    generate_suggestions,
    get_nlp,
    keyword_overlap_score,
    preprocess,
    tfidf_cosine_similarity,
)
from .skill_extractor import extract_skills

router = APIRouter()


# ---------------------------------------------------------------------------
# PDF text extraction helpers
# ---------------------------------------------------------------------------

def _extract_text_pdfplumber(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF using pdfplumber."""
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text_parts.append(extracted)
    return "\n".join(text_parts)


def _extract_pdf_text(pdf_bytes: bytes) -> str:
    """Try pdfplumber first; fall back gracefully."""
    try:
        text = _extract_text_pdfplumber(pdf_bytes)
        if text.strip():
            return text
    except Exception:
        pass
    raise HTTPException(
        status_code=422,
        detail="Could not extract text from the uploaded PDF. "
               "Ensure the file is a text-based (not scanned) PDF.",
    )


# ---------------------------------------------------------------------------
# /analyze endpoint
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    resume: UploadFile = File(..., description="Resume PDF file"),
    job_description: str = Form(..., description="Job description text"),
) -> JSONResponse:
    """
    Analyse a resume against a job description.

    Steps:
    1. Extract text from the uploaded PDF.
    2. Preprocess both texts via spaCy NLP pipeline.
    3. Extract skills from both texts.
    4. Compute TF-IDF cosine similarity + keyword overlap.
    5. Combine into a final score (60% semantic, 40% keyword).
    6. Return structured JSON result.
    """

    # --- Validate upload ---
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await resume.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    # --- Extract & preprocess ---
    raw_resume_text = _extract_pdf_text(pdf_bytes)
    nlp_model = get_nlp()

    processed_resume = preprocess(raw_resume_text)
    processed_jd = preprocess(job_description)

    # --- Skill extraction ---
    resume_skills = extract_skills(raw_resume_text, nlp_model)
    jd_skills = extract_skills(job_description, nlp_model)

    matched_skills = sorted(resume_skills & jd_skills)
    missing_skills = sorted(jd_skills - resume_skills)

    # --- Similarity scores ---
    cosine_score = tfidf_cosine_similarity(processed_resume, processed_jd)
    kw_score = keyword_overlap_score(processed_resume, processed_jd)

    # Also factor in skill match ratio
    skill_match_ratio = (
        len(matched_skills) / len(jd_skills) if jd_skills else 0.0
    )
    # Blend keyword overlap with skill match for the keyword score
    blended_kw_score = 0.5 * kw_score + 0.5 * skill_match_ratio

    # Final score: 60% cosine + 40% keyword
    final_score = 0.6 * cosine_score + 0.4 * blended_kw_score

    # Convert to percentages (round to 1 dp)
    similarity_pct = round(final_score * 100, 1)
    kw_pct = round(blended_kw_score * 100, 1)

    # --- Suggestions ---
    suggestions = generate_suggestions(missing_skills, final_score, blended_kw_score)

    result = AnalysisResult(
        similarity_score=similarity_pct,
        keyword_match_score=kw_pct,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        improvement_suggestions=suggestions,
    )

    return JSONResponse(content=result.model_dump())
