"""
nlp.py
Core NLP pipeline: text preprocessing, TF-IDF vectorisation, and
similarity scoring (cosine + keyword overlap).
"""

from __future__ import annotations

import re
from typing import List, Tuple

import numpy as np
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# Load spaCy model once at module level (reused across requests)
# ---------------------------------------------------------------------------
try:
    _nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError(
        "spaCy model 'en_core_web_sm' not found. "
        "Run: python -m spacy download en_core_web_sm"
    )


def get_nlp() -> spacy.Language:
    """Return the pre-loaded spaCy model."""
    return _nlp


# ---------------------------------------------------------------------------
# Text cleaning helpers
# ---------------------------------------------------------------------------

def _clean_text(text: str) -> str:
    """Remove URLs, email addresses, noisy punctuation, and extra whitespace."""
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-zA-Z0-9\s\.\,\+\#]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def preprocess(text: str) -> str:
    """
    Full NLP preprocessing:
      1. Lowercase + clean
      2. Tokenise with spaCy
      3. Remove stop-words and punctuation
      4. Lemmatise
    Returns a single string of processed tokens.
    """
    text = _clean_text(text.lower())
    doc = _nlp(text[:100_000])  # safety cap for very large inputs
    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and not token.is_space
        and len(token.lemma_) > 1
    ]
    return " ".join(tokens)


# ---------------------------------------------------------------------------
# TF-IDF cosine similarity
# ---------------------------------------------------------------------------

def tfidf_cosine_similarity(text_a: str, text_b: str) -> float:
    """Compute TF-IDF cosine similarity between two preprocessed texts."""
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    try:
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(np.clip(score, 0.0, 1.0))
    except ValueError:
        return 0.0


# ---------------------------------------------------------------------------
# Keyword / token overlap scoring
# ---------------------------------------------------------------------------

def keyword_overlap_score(text_a: str, text_b: str) -> float:
    """
    Compute the Jaccard-style keyword overlap between two preprocessed texts.
    Returns a value in [0, 1].
    """
    tokens_a = set(text_a.split())
    tokens_b = set(text_b.split())
    if not tokens_b:
        return 0.0
    intersection = tokens_a & tokens_b
    # Overlap against the JD token set (how many JD terms appear in resume)
    return float(len(intersection) / len(tokens_b))


# ---------------------------------------------------------------------------
# Improvement suggestion generator
# ---------------------------------------------------------------------------

def generate_suggestions(
    missing_skills: List[str],
    similarity_score: float,
    keyword_score: float,
) -> List[str]:
    suggestions: List[str] = []

    if missing_skills:
        top_missing = missing_skills[:5]
        suggestions.append(
            f"Add these key skills to your resume: {', '.join(top_missing)}."
        )

    if similarity_score < 0.4:
        suggestions.append(
            "Your resume content is quite different from the job description. "
            "Tailor your experience section to mirror the job's language and responsibilities."
        )
    elif similarity_score < 0.65:
        suggestions.append(
            "Moderate alignment detected. Strengthen your resume by incorporating "
            "more job-specific keywords and quantified achievements."
        )

    if keyword_score < 0.3:
        suggestions.append(
            "Low keyword overlap. Use exact phrases from the job description "
            "(especially in your summary and skills section) to improve ATS compatibility."
        )

    if not suggestions:
        suggestions.append(
            "Great match! Ensure your resume highlights measurable impact "
            "(e.g., percentages, revenue numbers) for each relevant role."
        )

    suggestions.append(
        "Use action verbs (e.g., 'Designed', 'Implemented', 'Optimised') "
        "at the start of each bullet point."
    )
    suggestions.append(
        "Keep your resume to 1–2 pages and ensure consistent formatting throughout."
    )

    return suggestions
