const API_BASE = "http://localhost:8000/api";

export interface UploadResponse {
  id: string;
  filename: string;
  format: string;
}

export async function uploadAudio(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}

export function getAudioUrl(fileId: string, filename: string): string {
  const ext = filename.split(".").pop();
  return `http://localhost:8000/files/${fileId}.${ext}`;
}