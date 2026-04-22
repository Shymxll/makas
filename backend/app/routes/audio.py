"""Audio upload ve processing endpoint'leri"""
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a"}

def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

def get_export_format(ext: str) -> tuple:
    """pydub için format ve codec döner"""
    if ext == ".m4a":
        return "ipod", "aac"
    return ext[1:], None

@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Ses dosyası yükle"""
    if not allowed_file(file.filename):
        raise HTTPException(400, "İzin verilen formatlar: mp3, wav, ogg, m4a")
    
    from app.main import UPLOAD_DIR
    
    file_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix.lower()
    file_path = UPLOAD_DIR / f"{file_id}{ext}"
    
    content = await file.read()
    file_path.write_bytes(content)
    
    return {"id": file_id, "filename": file.filename, "format": ext}

@router.post("/process")
async def process_audio(data: dict):
    """Ses dosyasını işle - tüm sessiz bölümleri keser"""
    from app.main import UPLOAD_DIR
    
    file_id = data.get("fileId")
    threshold = data.get("silenceThreshold", -40)
    min_silence_len = data.get("silenceMinLen", 500)
    padding = data.get("silencePadding", 100)

    files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
    if not files:
        raise HTTPException(404, "Dosya bulunamadı")
    
    audio_path = files[0]
    audio = AudioSegment.from_file(audio_path)
    
    nonsilent = detect_nonsilent(
        audio,
        min_silence_len=min_silence_len,
        silence_thresh=threshold
    )
    
    if not nonsilent:
        return {"url": f"/files/{file_id}{audio_path.suffix}"}
    
    chunks = []
    for i, (start, end) in enumerate(nonsilent):
        chunk_start = max(0, start - padding)
        chunk_end = min(len(audio), end + padding)
        chunks.append(audio[chunk_start:chunk_end])
    
    if not chunks:
        return {"url": f"/files/{file_id}{audio_path.suffix}"}
    
    processed = chunks[0]
    for chunk in chunks[1:]:
        processed = processed.append(chunk, crossfade=50)
    
    output_path = UPLOAD_DIR / f"{file_id}_processed{audio_path.suffix}"
    
    fmt, codec = get_export_format(audio_path.suffix)
    processed.export(output_path, format=fmt, codec=codec)
    
    return {"url": f"/files/{file_id}_processed{audio_path.suffix}"}

@router.post("/preview")
async def preview_silence(data: dict):
    """Kesilecek sessiz bölgeleri göster"""
    from app.main import UPLOAD_DIR
    
    file_id = data.get("fileId")
    threshold = data.get("silenceThreshold", -40)
    min_silence_len = data.get("silenceMinLen", 500)
    padding = data.get("silencePadding", 100)

    files = list(UPLOAD_DIR.glob(f"{file_id}.*"))
    if not files:
        raise HTTPException(404, "Dosya bulunamadı")
    
    audio_path = files[0]
    audio = AudioSegment.from_file(audio_path)
    duration_ms = len(audio)
    
    nonsilent = detect_nonsilent(
        audio,
        min_silence_len=min_silence_len,
        silence_thresh=threshold
    )
    
    if not nonsilent:
        return {"regions": [], "duration": duration_ms}
    
    regions = []
    prev_end = 0
    for start_s, end_s in nonsilent:
        if start_s > prev_end:
            regions.append({
                "start": prev_end,
                "end": start_s,
                "type": "silence"
            })
        prev_end = end_s
    
    if prev_end < duration_ms:
        regions.append({
            "start": prev_end,
            "end": duration_ms,
            "type": "silence"
        })
    
    kept_durations = []
    for start_s, end_s in nonsilent:
        kept_durations.append({
            "start": max(0, start_s - padding),
            "end": min(len(audio), end_s + padding)
        })
    
    first_start = max(0, nonsilent[0][0] - padding)
    last_end = min(len(audio), nonsilent[-1][1] + padding)
    
    return {
        "regions": regions,
        "duration": duration_ms,
        "keptStart": first_start,
        "keptEnd": last_end,
        "keptRegions": kept_durations
    }

@router.get("/download/{file_id}")
async def download_audio(file_id: str):
    """İşlenmiş dosyayı indir"""
    from app.main import UPLOAD_DIR
    
    files = list(UPLOAD_DIR.glob(f"{file_id}_processed.*"))
    if not files:
        raise HTTPException(404, "Dosya bulunamadı")
    
    audio_path = files[0]
    return FileResponse(
        audio_path,
        filename=f"makas_processed{audio_path.suffix}",
        media_type="audio/mpeg"
    )