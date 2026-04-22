# Makas

Audio processing tool for content creators.

## Özellikler / Features

- Ses dosyası yükleme (MP3, WAV, OGG, M4A) / Upload audio files
- Sessiz bölümleri otomatik temizleme / Automatic silence removal
- Waveform görselleştirme / Waveform visualization
- Preview ile kesilecek bölümleri görme / Preview silence regions

## Kurulum / Setup

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

## Teknolojiler / Technologies

- **Backend**: FastAPI, pydub, noisereduce
- **Frontend**: Next.js, TypeScript, wavesurfer.js, shadcn/ui

## Katkı / Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Lisans / License

MIT License