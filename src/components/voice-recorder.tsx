"use client";

import { useRef, useState } from "react";
import { Mic, Square, Loader2, X } from "lucide-react";

export function VoiceRecorder({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUploading(true);
        try {
          const form = new FormData();
          form.append("file", new File([blob], "voice-note.webm", { type: "audio/webm" }));
          form.append("folder", "voice-notes");
          const res = await fetch("/api/upload", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");
          onChange(data.url);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <div>
      <span className="text-sm font-medium text-ink-muted">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        {value && !recording ? (
          <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-surface px-2 py-1.5">
            <audio controls src={value} className="h-8 flex-1" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 rounded-full p-1.5 text-ink-muted hover:bg-canvas hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              recording
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-ink-muted hover:border-ink hover:text-ink"
            } disabled:opacity-50`}
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : recording ? (
              <Square size={13} fill="currentColor" />
            ) : (
              <Mic size={15} />
            )}
            {uploading ? "Uploading…" : recording ? `Recording… ${seconds}s` : "Record voice note"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  );
}
