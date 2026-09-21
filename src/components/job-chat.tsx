"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { SinglePhotoUpload } from "@/components/image-upload";
import { VoiceRecorder } from "@/components/voice-recorder";

type Message = {
  id: string;
  senderId: string;
  content: string | null;
  imageUrl: string | null;
  voiceNoteUrl: string | null;
  createdAt: string;
  sender: { name: string };
};

export function JobChat({ jobId, viewerId, otherPartyName }: { jobId: string; viewerId: string; otherPartyName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/jobs/${jobId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount + poll
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imageUrl && !voiceUrl) return;
    setSending(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(text.trim() ? { content: text.trim() } : {}),
          ...(imageUrl ? { imageUrl } : {}),
          ...(voiceUrl ? { voiceNoteUrl: voiceUrl } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setText("");
        setImageUrl(null);
        setVoiceUrl(null);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-3xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h1 className="font-display text-xl text-ink">Chat with {otherPartyName}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-ink-muted">No messages yet — say hello.</p>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((m) => {
            const mine = m.senderId === viewerId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                    mine ? "bg-ink text-canvas" : "bg-canvas text-ink"
                  }`}
                >
                  {m.content && <p>{m.content}</p>}
                  {m.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.imageUrl} alt="" className="mt-1 max-h-48 rounded-lg object-cover" />
                  )}
                  {m.voiceNoteUrl && <audio controls src={m.voiceNoteUrl} className="mt-1 h-8 w-48" />}
                  <p className={`mt-1 text-[10px] ${mine ? "text-canvas/60" : "text-ink-muted"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="border-t border-border px-6 py-4">
        <div className="mb-2 flex items-center gap-4">
          <SinglePhotoUpload folder="chat" value={imageUrl} onChange={setImageUrl} label="" />
          <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} label="" />
        </div>
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="input"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex shrink-0 items-center justify-center rounded-full bg-accent p-3 text-accent-ink hover:brightness-110 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
