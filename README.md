# Makas

İçerik üreticileri için ses işleme aracı.

## Özellikler

- Ses dosyası yükleme (MP3, WAV, OGG, M4A)
- Sessiz bölümleri otomatik temizleme
- Waveform görselleştirme (öncesi/sonrası)
- Preview ile kesilecek bölümleri görme

## Kurulum

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Teknolojiler

- **Backend**: FastAPI, pydub, noisereduce
- **Frontend**: Next.js, TypeScript, wavesurfer.js