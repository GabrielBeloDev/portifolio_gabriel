"use client";

import { useRef, useState } from "react";
import { z } from "zod";

type RecordingState = "idle" | "recording" | "transcribing";

const recordLabel: Record<RecordingState, string> = {
  idle: "ditar",
  recording: "gravando… parar",
  transcribing: "transcrevendo…",
};

const transcribeResponseSchema = z.object({ text: z.string() });
const transcribeErrorSchema = z.object({ error: z.string() });

const PREFERRED_MIME_TYPE = "audio/webm";

export function RecordButton({
  onTranscribed,
}: {
  onTranscribed: (text: string) => void;
}) {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  async function startRecording() {
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("microfone bloqueado — libere o acesso para ditar");
      return;
    }

    const canRecordWebm = MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE);
    const recorder = canRecordWebm
      ? new MediaRecorder(stream, { mimeType: PREFERRED_MIME_TYPE })
      : new MediaRecorder(stream);

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      for (const track of stream.getTracks()) track.stop();
      const audio = new Blob(chunks, {
        type: recorder.mimeType || PREFERRED_MIME_TYPE,
      });
      void transcribe(audio);
    };

    recorder.start();
    recorderRef.current = recorder;
    setState("recording");
  }

  async function transcribe(audio: Blob) {
    setState("transcribing");

    const formData = new FormData();
    formData.append("audio", audio, "ditado.webm");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const payload: unknown = await response.json();
      const parsed = transcribeResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        const parsedError = transcribeErrorSchema.safeParse(payload);
        setError(
          parsedError.success
            ? parsedError.data.error
            : `erro ${response.status} ao transcrever`,
        );
        return;
      }
      onTranscribed(parsed.data.text);
    } catch {
      setError("falha ao enviar o áudio para transcrição");
    } finally {
      setState("idle");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  const isRecording = state === "recording";

  return (
    <>
      <button
        type="button"
        onClick={isRecording ? stopRecording : () => void startRecording()}
        disabled={state === "transcribing"}
        className="flex items-center gap-1.5 rounded-sm border border-line bg-surface px-2 py-1 font-mono text-xs text-link transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRecording && (
          <span
            aria-hidden
            className="home-pulse size-1.5 rounded-full bg-danger"
          />
        )}
        {recordLabel[state]}
      </button>
      {error !== null && (
        <span role="alert" className="font-mono text-xs text-danger">
          {error}
        </span>
      )}
    </>
  );
}
