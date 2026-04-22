"""Ses işleme pipeline"""
from pathlib import Path
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

def remove_silence(
    audio_path: Path,
    threshold: float = -40.0,
    min_silence_len: int = 500,
    padding: int = 100
) -> Path:
    """Sessiz bölümleri temizle"""
    audio = AudioSegment.from_file(audio_path)
    
    nonsilent = detect_nonsilent(
        audio,
        min_silence_len=min_silence_len,
        silence_thresh=threshold
    )
    
    if not nonsilent:
        return audio_path
    
    start = max(0, nonsilent[0][0] - padding)
    end = min(len(audio), nonsilent[-1][1] + padding)
    
    processed = audio[start:end]
    output_path = audio_path.parent / f"{audio_path.stem}_denoised{audio_path.suffix}"
    processed.export(output_path, format=audio_path.suffix[1:])
    
    return output_path