"""
skill_extractor.py
Extracts technical skills from text using a predefined dictionary and spaCy NER.
"""

from typing import Set
import spacy

# ---------------------------------------------------------------------------
# Predefined skill dictionary (extend as needed)
# ---------------------------------------------------------------------------
SKILL_DICTIONARY: Set[str] = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c", "c++", "c#", "go",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab",
    "perl", "bash", "shell", "powershell",

    # Web Frameworks & Libraries
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "django",
    "flask", "fastapi", "express", "spring", "laravel", "rails",
    "asp.net", "nestjs",

    # Databases
    "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra",
    "dynamodb", "oracle", "mssql", "elasticsearch", "neo4j", "firebase",
    "supabase",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "gitlab ci", "ci/cd", "helm", "prometheus",
    "grafana", "nginx", "apache",

    # Machine Learning & AI
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "matplotlib", "seaborn", "hugging face", "bert",
    "gpt", "transformers", "opencv", "xgboost", "lightgbm",

    # Data & Analytics
    "data analysis", "data science", "data engineering", "spark", "hadoop",
    "kafka", "airflow", "dbt", "tableau", "power bi", "looker", "bigquery",

    # Practices & Tools
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "agile",
    "scrum", "kanban", "rest api", "graphql", "grpc", "microservices",
    "devops", "sre", "tdd", "bdd", "linux", "unix",

    # Soft/Domain Skills
    "leadership", "communication", "teamwork", "problem solving", "project management",
    "product management",
}

# Normalised lookup set (all lowercase, stripped)
_NORMALISED_SKILLS = {s.lower().strip() for s in SKILL_DICTIONARY}


def extract_skills(text: str, nlp_model: spacy.Language) -> Set[str]:
    """
    Extract technical skills from *text* by:
    1. Matching against the predefined skill dictionary (n-gram aware).
    2. Using spaCy NER to capture PRODUCT / ORG entities that look like tools.
    """
    text_lower = text.lower()
    found: Set[str] = set()

    # --- 1. Dictionary matching (up to 3-gram) ---
    tokens = text_lower.split()
    for n in (1, 2, 3):
        for i in range(len(tokens) - n + 1):
            ngram = " ".join(tokens[i : i + n])
            if ngram in _NORMALISED_SKILLS:
                found.add(ngram)

    # --- 2. spaCy NER-based extraction ---
    doc = nlp_model(text[:100_000])  # spaCy limit safety
    for ent in doc.ents:
        candidate = ent.text.lower().strip()
        if ent.label_ in {"PRODUCT", "ORG", "WORK_OF_ART"} and candidate in _NORMALISED_SKILLS:
            found.add(candidate)

    return found
