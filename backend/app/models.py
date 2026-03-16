from pydantic import BaseModel
from typing import List


class AnalysisResult(BaseModel):
    similarity_score: float
    keyword_match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    improvement_suggestions: List[str]
