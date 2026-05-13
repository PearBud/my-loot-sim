"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type WaveformMinigameProps = {
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

type WaveTarget = {
  frequency: number;
  amplitude: number;
};

const FREQUENCY_RANGE = { min: 1, max: 8, step: 0.01 } as const;
const AMPLITUDE_RANGE = { min: 20, max: 90, step: 0.1 } as const;
const MATCH_TOLERANCE = 0.05;
const LOCK_MS = 1500;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function isWithinTolerance(current: number, target: number) {
  return Math.abs(current - target) / target < MATCH_TOLERANCE;
}

function formatNumber(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function WaveformMinigame({
  title = "波形同步",
  subtitle = "同步保险箱锁芯频谱，完成后获得本局搜索权限",
  onSuccess,
  onCancel,
}: WaveformMinigameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lockStartRef = useRef<number | null>(null);
  const successCalledRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const [target] = useState<WaveTarget>(() => ({
    frequency: randomBetween(FREQUENCY_RANGE.min + 0.7, FREQUENCY_RANGE.max - 0.7),
    amplitude: randomBetween(AMPLITUDE_RANGE.min + 8, AMPLITUDE_RANGE.max - 8),
  }));
  const [frequency, setFrequency] = useState(() => randomBetween(FREQUENCY_RANGE.min, FREQUENCY_RANGE.max));
  const [amplitude, setAmplitude] = useState(() => randomBetween(AMPLITUDE_RANGE.min, AMPLITUDE_RANGE.max));
  const [lockProgress, setLockProgress] = useState(0);

  const matched = useMemo(
    () => isWithinTolerance(frequency, target.frequency) && isWithinTolerance(amplitude, target.amplitude),
    [amplitude, frequency, target.amplitude, target.frequency],
  );

  const drawWave = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, wave: WaveTarget, color: string, alpha: number, glow: number) => {
      const midY = height / 2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.beginPath();

      for (let x = 0; x <= width; x += 2) {
        const normalizedX = x / width;
        const y = midY + Math.sin(normalizedX * Math.PI * 2 * wave.frequency) * wave.amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.restore();
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastProgressBucket = -1;

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cssWidth = rect.width;
      const cssHeight = rect.height;
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const gradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
      gradient.addColorStop(0, "rgba(24,24,27,0.92)");
      gradient.addColorStop(0.45, "rgba(3,7,18,0.9)");
      gradient.addColorStop(1, "rgba(20,83,45,0.24)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      ctx.save();
      ctx.strokeStyle = "rgba(113,113,122,0.18)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= cssWidth; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= cssHeight; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cssWidth, y);
        ctx.stroke();
      }
      ctx.restore();

      const pulse = matched ? 0.5 + Math.sin(now / 110) * 0.5 : 0;
      const successColor = matched ? `rgba(34, 197, 94, ${0.78 + pulse * 0.22})` : "rgba(59, 130, 246, 0.86)";
      const successGlow = matched ? 30 + pulse * 18 : 15;

      drawWave(ctx, cssWidth, cssHeight, target, "rgba(244, 244, 245, 0.58)", 1, 18);
      drawWave(ctx, cssWidth, cssHeight, { frequency, amplitude }, successColor, 1, successGlow);

      if (matched) {
        if (lockStartRef.current === null) lockStartRef.current = now;
        const progress = Math.min(1, (now - lockStartRef.current) / LOCK_MS);
        const bucket = Math.floor(progress * 100);
        if (bucket !== lastProgressBucket) {
          lastProgressBucket = bucket;
          setLockProgress(progress);
        }
        if (progress >= 1 && !successCalledRef.current) {
          successCalledRef.current = true;
          onSuccess();
          return;
        }
      } else {
        lockStartRef.current = null;
        lastProgressBucket = -1;
        setLockProgress(0);
      }

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [amplitude, drawWave, frequency, matched, onSuccess, target]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl overflow-hidden rounded-xl border border-emerald-400/20 bg-zinc-950/88 text-zinc-100 shadow-[0_0_90px_rgba(16,185,129,0.16)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="waveform-title"
      >
        <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950/30 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.34em] text-emerald-300/80">Waveform Sync Decryption</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="waveform-title" className="text-2xl font-semibold tracking-wide text-zinc-50">
                {title}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            </div>
            <div className="rounded border border-zinc-700 bg-black/30 px-3 py-2 text-right font-mono text-xs text-zinc-400">
              <p>LOCK {Math.round(lockProgress * 100).toString().padStart(3, "0")}%</p>
              <p className={matched ? "text-emerald-300" : "text-zinc-500"}>{matched ? "SYNC STABLE" : "SIGNAL DRIFT"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className={`rounded-lg border bg-black/40 p-2 ${matched ? "border-emerald-400/60 shadow-[0_0_36px_rgba(34,197,94,0.28)]" : "border-zinc-800"}`}>
            <canvas ref={canvasRef} className="h-64 w-full rounded-md" aria-label="目标波形与玩家波形对齐画布" />
          </div>

          <div className="h-2 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900">
            <motion.div
              className="h-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.95)]"
              animate={{ width: `${lockProgress * 100}%` }}
              transition={{ duration: 0.08 }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-300">频率</span>
                <span className="font-mono text-xs text-emerald-300">{formatNumber(frequency)}</span>
              </div>
              <input
                type="range"
                min={FREQUENCY_RANGE.min}
                max={FREQUENCY_RANGE.max}
                step={FREQUENCY_RANGE.step}
                value={frequency}
                onChange={(event) => setFrequency(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-emerald-400 outline-none"
              />
            </label>

            <label className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-300">振幅</span>
                <span className="font-mono text-xs text-emerald-300">{formatNumber(amplitude, 1)}</span>
              </div>
              <input
                type="range"
                min={AMPLITUDE_RANGE.min}
                max={AMPLITUDE_RANGE.max}
                step={AMPLITUDE_RANGE.step}
                value={amplitude}
                onChange={(event) => setAmplitude(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-emerald-400 outline-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
            <p className="text-sm text-zinc-500">将玩家波与目标波误差压到 5% 内，并稳定保持 1.5 秒。</p>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-red-500/30 bg-red-950/20 px-4 py-2 text-sm text-red-200 transition hover:border-red-400/60 hover:bg-red-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
            >
              跳过破解
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
