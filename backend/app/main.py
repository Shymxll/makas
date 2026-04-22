"""Makas Backend - FastAPI uygulaması"""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="Makas Audio Processor",
    description="İçerik üreticileri için ses işleme aracı",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")

from app.routes import audio
app.include_router(audio.router, prefix="/api", tags=["audio"])