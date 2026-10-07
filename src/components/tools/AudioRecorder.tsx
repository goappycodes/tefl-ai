"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Play, Pause, Upload, Trash2, Loader2, AlertCircle } from "lucide-react";

export interface AudioValue {
  /** base64-encoded WAV payload (no data: prefix). */
  data: string;
  /** Length in seconds. */
  duration: number;
  /** Container format sent to the model (always "wav" here). */
  format: string;
}

interface AudioRecorderProps {
  value: AudioValue | null;
  onChange: (v: AudioValue | null) => void;
  minSeconds?: number;
  maxSeconds?: number;
  disabled?: boolean;
}

type Status = "idle" | "recording" | "processing" | "ready" | "error";

function fmtTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
}

/* ---- Client-side WAV (16 kHz mono) encoding — ports the WordPress
   ielts-speaking-band-estimator.js helpers so OpenRouter's multimodal model
   receives WAV, which it accepts (webm is not reliably supported). ---- */

function getAudioContext(): AudioContext {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API is not supported in this browser.");
  return new Ctor();
}

function encodeWav(audioBuffer: AudioBuffer, targetRate: number): ArrayBuffer {
  const srcRate = audioBuffer.sampleRate;
  const numCh = audioBuffer.numberOfChannels;
  const srcLen = audioBuffer.length;

  // Downmix to mono.
  const mono = new Float32Array(srcLen);
  for (let c = 0; c < numCh; c++) {
    const d = audioBuffer.getChannelData(c);
    for (let i = 0; i < srcLen; i++) mono[i] += d[i] / numCh;
  }

  // Linear-resample to the target rate.
  const ratio = srcRate / targetRate;
  const outLen = Math.max(1, Math.floor(srcLen / ratio));
  const out = new Int16Array(outLen);
  for (let j = 0; j < outLen; j++) {
    const pos = j * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, srcLen - 1);
    const frac = pos - i0;
    let s = mono[i0] * (1 - frac) + mono[i1] * frac;
    s = Math.max(-1, Math.min(1, s));
    out[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const dataLen = out.length * 2;
  const buffer = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buffer);
  const ws = (off: number, str: string) => {
    for (let k = 0; k < str.length; k++) view.setUint8(off + k, str.charCodeAt(k));
  };
  ws(0, "RIFF");
  view.setUint32(4, 36 + dataLen, true);
  ws(8, "WAVE");
  ws(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ws(36, "data");
  view.setUint32(40, dataLen, true);
  let off = 44;
  for (let m = 0; m < out.length; m++) {
    view.setInt16(off, out[m], true);
    off += 2;
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

/** Decode any browser-supported audio blob/file, re-encode to 16 kHz mono WAV
 *  base64, and return the payload plus its true duration. */
async function blobToWav(blob: Blob): Promise<{ data: string; duration: number }> {
  const buf = await blob.arrayBuffer();
  const ac = getAudioContext();
  try {
    const audioBuffer = await ac.decodeAudioData(buf.slice(0));
    const wav = encodeWav(audioBuffer, 16000);
    return { data: arrayBufferToBase64(wav), duration: audioBuffer.duration };
  } finally {
    if (ac.state !== "closed") void ac.close();
  }
}

export function AudioRecorder({
  value,
  onChange,
  minSeconds = 30,
  maxSeconds = 180,
  disabled = false,
}: AudioRecorderProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setBlob = useCallback(
    async (blob: Blob) => {
      setStatus("processing");
      setError(null);
      try {
        const { data, duration } = await blobToWav(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setElapsed(duration);
        onChange({ data, duration, format: "wav" });
        setStatus("ready");
      } catch (err) {
        console.error("Audio processing failed:", err);
        setError("Could not process that audio. Please try a different recording or file.");
        setStatus("error");
        onChange(null);
      }
    },
    [audioUrl, onChange]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support audio recording. Try Chrome, Firefox or Safari.");
      setStatus("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (chunksRef.current.length === 0) {
          setError("No audio captured. Please try again.");
          setStatus("error");
          return;
        }
        void setBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setElapsed(0);
      setStatus("recording");
      onChange(null);

      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 250);
      autoStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          stopTimer();
          setStatus("processing");
        }
      }, maxSeconds * 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Unable to access your microphone. Please grant permission and try again.");
      setStatus("error");
    }
  }, [maxSeconds, onChange, setBlob, stopTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    setStatus("processing");
  }, [stopTimer]);

  const onUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) void setBlob(file);
    },
    [setBlob]
  );

  const clear = useCallback(() => {
    stopTimer();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setElapsed(0);
    setError(null);
    setPlaying(false);
    setStatus("idle");
    onChange(null);
  }, [audioUrl, onChange, stopTimer]);

  const togglePlay = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const tooShort = value != null && value.duration < minSeconds;
  const recording = status === "recording";
  const processing = status === "processing";

  return (
    <div className="space-y-4">
      {/* Timer / status display */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white/[0.02] p-6">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
            recording
              ? "animate-pulse bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
              : "bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]"
          }`}
        >
          {processing ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </div>

        <div className="text-center">
          <div className="font-mono text-2xl font-semibold tabular-nums text-[var(--color-ink)]">
            {fmtTime(elapsed)}
          </div>
          <p className="mt-1 text-xs text-[var(--color-faint)]">
            {recording
              ? "Recording… speak clearly into your microphone"
              : processing
                ? "Processing your audio…"
                : value
                  ? "Recording ready"
                  : `Record or upload ${minSeconds}+ seconds of speech`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!recording && !value && (
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled || processing}
              className="btn btn-primary !py-2.5 !px-5 text-sm disabled:opacity-60"
            >
              <Mic className="h-4 w-4" /> Start recording
            </button>
          )}

          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="btn btn-primary !py-2.5 !px-5 text-sm"
            >
              <Square className="h-4 w-4" /> Stop
            </button>
          )}

          {value && !recording && (
            <>
              <button
                type="button"
                onClick={togglePlay}
                className="btn btn-ghost !py-2.5 !px-4 text-sm"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={clear}
                className="btn btn-ghost !py-2.5 !px-4 text-sm"
              >
                <Trash2 className="h-4 w-4" /> Clear
              </button>
            </>
          )}
        </div>

        {/* Upload alternative */}
        {!recording && !value && (
          <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-xs text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline">
            <Upload className="h-3.5 w-3.5" />
            or upload an audio file
            <input
              type="file"
              accept="audio/*"
              onChange={onUpload}
              disabled={disabled || processing}
              className="sr-only"
            />
          </label>
        )}

        {audioUrl && (
          <audio
            ref={audioElRef}
            src={audioUrl}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        )}
      </div>

      {tooShort && (
        <p className="flex items-center gap-2 text-xs text-[var(--color-warning)]">
          <AlertCircle className="h-3.5 w-3.5" />
          That clip is {Math.round(value!.duration)}s. Please record at least {minSeconds} seconds
          for a meaningful assessment.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
