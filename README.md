# 🧠 Smart Resume Analyzer

> **AI-powered resume analysis and job matching system** — upload your resume, paste a job description, and get instant ATS scores, skill gap insights, and personalized improvement suggestions.

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Instant Analysis** | Results in seconds using TF-IDF + spaCy NLP |
| 🎯 **ATS Optimization** | Beat applicant tracking systems with keyword gap analysis |
| 🤖 **AI Feedback** | Personalized suggestions to improve your resume |
| ✦ **Smart Matching** | Cosine similarity + keyword overlap scoring |
| 📱 **Fully Responsive** | Works on laptop, tablet, and phone |

---

## 🗂️ Project Structure

```
NLP-project/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point + CORS
│   │   ├── routes.py          # POST /analyze endpoint
│   │   ├── nlp.py             # NLP pipeline (spaCy, TF-IDF, scoring)
│   │   ├── skill_extractor.py # Skill dictionary + NER extraction
│   │   └── models.py          # Pydantic response models
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx            # Root component (split-panel layout)
        ├── main.jsx           # React entry point
        └── index.css          # Global styles (purple gradient theme)
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm

# Start the API server
uvicorn app.main:app --reload
```

Backend runs at → `http://localhost:8000`
Interactive API docs → `http://localhost:8000/docs`

---

### 2. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 🔌 API Reference

### `POST /analyze`

Accepts a PDF resume and a job description, returns a full match analysis.

**Request** (multipart/form-data)

| Field | Type | Description |
|---|---|---|
| `resume` | `File` (PDF) | Candidate's resume file |
| `job_description` | `string` | Full job description text |

**Response**

```json
{
  "similarity_score": 72.4,
  "keyword_match_score": 65.0,
  "matched_skills": ["python", "docker", "sql"],
  "missing_skills": ["kubernetes", "terraform"],
  "improvement_suggestions": [
    "Add Kubernetes to your skills section.",
    "Mention infrastructure-as-code experience with Terraform."
  ]
}
```

### `GET /`

Health check — returns `{ "status": "ok" }`.

---

## 🧮 Scoring Formula

```
Final Score  = 0.6 × TF-IDF Cosine Similarity
             + 0.4 × Blended Keyword Score

Blended KW   = 0.5 × Token Overlap
             + 0.5 × Skill Match Ratio
```

| Score Range | Match Grade |
|---|---|
| 75 – 100% | 🎯 Excellent Match |
| 55 – 74% | 👍 Good Match |
| 35 – 54% | 🔧 Fair Match |
| 0 – 34% | ⚠️ Weak Match |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI (Python 3.11) + Uvicorn |
| **NLP** | spaCy `en_core_web_sm` + TF-IDF (scikit-learn) |
| **Similarity** | Cosine similarity + keyword overlap scoring |
| **PDF Extraction** | pdfplumber |
| **Frontend** | React 19 + Vite 7 |
| **Styling** | Vanilla CSS (purple gradient theme) |
| **HTTP Client** | Axios |
| **CORS** | FastAPI CORSMiddleware |

---

## 📋 Environment Variables (optional)

Create a `.env` file in `frontend/` to override the default API URL:

```env
VITE_API_URL=http://localhost:8000
```

---

## 📝 License

MIT — free to use, modify, and distribute.
