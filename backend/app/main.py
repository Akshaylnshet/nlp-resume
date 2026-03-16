"""
main.py
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router

app = FastAPI(
    title="Intelligent Resume Analyzer",
    description="AI-powered resume analysis and job matching system.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS – allow local Vite dev server and any deployed frontend origin
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["health"])
async def health_check():
    return {"status": "ok", "message": "Resume Analyzer API is running."}
