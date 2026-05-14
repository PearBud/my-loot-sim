"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type LogicGridMinigameProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

type AccessState = "active" | "granted";

const LIGHT_COUNT = 4;
const MIN_SHUFFLE_MOVES = 3;
const MAX_SHUFFLE_MOVES = 5;
const SUCCESS_DELAY_MS = 500;

function toggleAt(lights: boolean[], index: number) {
  return lights.map((light, lightIndex) => (Math.abs(lightIndex - index) <= 1 ? !light : light));
}

function createShuffledLights() {
  let lights = Array<boolean>(LIGHT_COUNT).fill(true);
  const moveCount = MIN_SHUFFLE_MOVES + Math.floor(Math.random() * (MAX_SHUFFLE_MOVES - MIN_SHUFFLE_MOVES + 1));

  for (let move = 0; move < moveCount; move += 1) {
    const index = Math.floor(Math.random() * LIGHT_COUNT);
    lights = toggleAt(lights, index);
  }

  if (lights.every(Boolean)) {
    lights = toggleAt(lights, Math.floor(Math.random() * LIGHT_COUNT));
  }

  return lights;
}

export function LogicGridMinigame({ onSuccess, onCancel }: LogicGridMinigameProps) {
  const [lights, setLights] = useState(() => createShuffledLights());
  const [accessState, setAccessState] = useState<AccessState>("active");
  const successTimerRef = useRef<number | null>(null);

  const solved = useMemo(() => lights.every(Boolean), [lights]);

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    },
    [],
  );

  const pressSwitch = useCallback(
    (index: number) => {
      if (accessState === "granted") return;

      setLights((currentLights) => {
        const nextLights = toggleAt(currentLights, index);
        if (nextLights.every(Boolean)) {
          setAccessState("granted");
          successTimerRef.current = window.setTimeout(() => {
            onSuccess();
          }, SUCCESS_DELAY_MS);
        }
        return nextLights;
      });
    },
    [accessState, onSuccess],
  );

  const statusText = accessState === "granted" ? "BRIDGE STABLE" : "RELINK REQUIRED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-emerald-400/20 bg-zinc-950/90 text-zinc-100 shadow-[0_0_90px_rgba(16,185,129,0.15)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logic-grid-minigame-title"
      >
        <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950/30 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.34em] text-emerald-300/80">Logic Bridge Override</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="logic-grid-minigame-title" className="text-2xl font-semibold tracking-wide text-zinc-50">
                逻辑链路重组 (Logic Bridge Override)
              </h2>
              <p className="mt-1 text-sm text-zinc-500">重排四段逻辑链路，使所有指示灯同时进入绿色同步状态。</p>
            </div>
            <div
              className={`rounded border bg-black/35 px-3 py-2 text-right font-mono text-xs transition ${
                solved
                  ? "border-emerald-400/70 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.28)]"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              <p>{statusText}</p>
              <p className="text-[10px] text-zinc-500">NODE_CHAIN::04</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="relative overflow-hidden rounded-lg border border-emerald-400/20 bg-black/55 p-6 shadow-[inset_0_0_34px_rgba(16,185,129,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.04)_1px,transparent_1px)] bg-[length:100%_8px,32px_100%] opacity-70" />
            <div className="pointer-events-none absolute -inset-x-10 top-0 h-px animate-pulse bg-emerald-300/70 shadow-[0_0_22px_rgba(110,231,183,0.9)]" />

            <div className="relative mx-auto max-w-md">
              <div className="mb-6 grid grid-cols-4 gap-4" aria-label="逻辑链路指示灯">
                {lights.map((isActive, index) => (
                  <div key={`light-${index}`} className="flex flex-col items-center gap-2">
                    <div
                      className={`h-16 w-16 rounded-full border-2 transition-colors duration-300 md:h-20 md:w-20 ${
                        isActive
                          ? "border-emerald-200 bg-emerald-400 shadow-[0_0_28px_rgba(52,211,153,0.95),inset_0_0_18px_rgba(236,253,245,0.45)]"
                          : "border-red-900/80 bg-red-950/70 shadow-[inset_0_0_18px_rgba(0,0,0,0.75)]"
                      }`}
                      aria-label={`第 ${index + 1} 个指示灯：${isActive ? "绿色开启" : "红色关闭"}`}
                    />
                    <span className="font-mono text-[10px] text-zinc-500">L-{index + 1}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4" aria-label="逻辑链路开关">
                {lights.map((_, index) => (
                  <button
                    key={`switch-${index}`}
                    type="button"
                    onClick={() => pressSwitch(index)}
                    disabled={accessState === "granted"}
                    className="aspect-square border-2 border-zinc-700 bg-zinc-950 font-mono text-sm text-zinc-300 transition hover:border-emerald-400/70 hover:bg-zinc-800 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-emerald-400/50 disabled:text-emerald-300 disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
                    aria-label={`反转第 ${index + 1} 个开关及相邻指示灯`}
                  >
                    SW-{index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
            <p className="font-mono text-xs text-zinc-500" aria-live="polite">
              {solved ? "链路同步完成：正在接管保险箱权限。" : "点击开关会同时反转自身与左右相邻指示灯。"}
            </p>
            <button
              type="button"
              onClick={onCancel}
              disabled={accessState === "granted"}
              className="rounded-md border border-red-500/30 bg-red-950/20 px-4 py-2 text-sm text-red-200 transition hover:border-red-400/60 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"
            >
              跳过破解
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
