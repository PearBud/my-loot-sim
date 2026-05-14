"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type OpticalBypassMinigameProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

type Direction = "U" | "R" | "D" | "L";
type MirrorOrientation = "/" | "\\";
type Point = { row: number; col: number };
type Mirror = Point & { orientation: MirrorOrientation };
type AccessState = "active" | "granted";

type OpticalTemplate = {
  mirrors: Mirror[];
};

const GRID_SIZE = 3;
const SUCCESS_DELAY_MS = 1000;
const START: Point = { row: 0, col: 0 };
const RECEIVER: Point = { row: 2, col: 2 };

const TEMPLATES: OpticalTemplate[] = [
  {
    mirrors: [
      { row: 0, col: 1, orientation: "\\" },
      { row: 1, col: 1, orientation: "\\" },
      { row: 1, col: 2, orientation: "\\" },
    ],
  },
  {
    mirrors: [
      { row: 0, col: 1, orientation: "\\" },
      { row: 1, col: 1, orientation: "/" },
      { row: 1, col: 0, orientation: "/" },
      { row: 2, col: 0, orientation: "\\" },
    ],
  },
  {
    mirrors: [
      { row: 0, col: 1, orientation: "\\" },
      { row: 2, col: 1, orientation: "/" },
      { row: 2, col: 0, orientation: "\\" },
      { row: 1, col: 0, orientation: "/" },
      { row: 1, col: 2, orientation: "\\" },
    ],
  },
];

const DELTA: Record<Direction, Point> = {
  U: { row: -1, col: 0 },
  R: { row: 0, col: 1 },
  D: { row: 1, col: 0 },
  L: { row: 0, col: -1 },
};

const SLASH_REFLECT: Record<Direction, Direction> = { U: "R", R: "U", D: "L", L: "D" };
const BACKSLASH_REFLECT: Record<Direction, Direction> = { U: "L", R: "D", D: "R", L: "U" };

function samePoint(a: Point, b: Point) {
  return a.row === b.row && a.col === b.col;
}

function mirrorKey(point: Point) {
  return `${point.row}-${point.col}`;
}

function rotateMirror(orientation: MirrorOrientation): MirrorOrientation {
  return orientation === "/" ? "\\" : "/";
}

function reflect(direction: Direction, orientation: MirrorOrientation) {
  return orientation === "/" ? SLASH_REFLECT[direction] : BACKSLASH_REFLECT[direction];
}

function pickTemplate() {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  return template.mirrors.map((mirror) => ({ ...mirror }));
}

function createMirrors() {
  const solvedMirrors = pickTemplate();
  let scrambled = solvedMirrors.map((mirror) => ({ ...mirror, orientation: Math.random() < 0.5 ? mirror.orientation : rotateMirror(mirror.orientation) }));

  if (traceLaser(scrambled).solved) {
    const index = Math.floor(Math.random() * scrambled.length);
    scrambled = scrambled.map((mirror, mirrorIndex) => (mirrorIndex === index ? { ...mirror, orientation: rotateMirror(mirror.orientation) } : mirror));
  }

  return scrambled;
}

function traceLaser(mirrors: Mirror[]) {
  const mirrorMap = new Map(mirrors.map((mirror) => [mirrorKey(mirror), mirror]));
  const visitedMirrors = new Set<string>();
  const points: Point[] = [START];
  let current = START;
  let direction: Direction = "R";

  for (let step = 0; step < 24; step += 1) {
    const delta = DELTA[direction];
    const next = { row: current.row + delta.row, col: current.col + delta.col };

    if (next.row < 0 || next.row >= GRID_SIZE || next.col < 0 || next.col >= GRID_SIZE) {
      return { solved: false, points };
    }

    points.push(next);

    if (samePoint(next, RECEIVER)) {
      return { solved: visitedMirrors.size === mirrors.length, points };
    }

    const mirror = mirrorMap.get(mirrorKey(next));
    if (mirror) {
      const key = mirrorKey(mirror);
      if (visitedMirrors.has(key)) return { solved: false, points };
      visitedMirrors.add(key);
      direction = reflect(direction, mirror.orientation);
    }

    current = next;
  }

  return { solved: false, points };
}

function toSvgPoint(point: Point) {
  return `${point.col * 100 + 50},${point.row * 100 + 50}`;
}

function cellLabel(row: number, col: number) {
  if (samePoint({ row, col }, START)) return "激光发射器";
  if (samePoint({ row, col }, RECEIVER)) return "激光接收器";
  return `光学节点 ${row + 1}-${col + 1}`;
}

export function OpticalBypassMinigame({ onSuccess, onCancel }: OpticalBypassMinigameProps) {
  const [mirrors, setMirrors] = useState(() => createMirrors());
  const [accessState, setAccessState] = useState<AccessState>("active");
  const successTimerRef = useRef<number | null>(null);
  const trace = useMemo(() => traceLaser(mirrors), [mirrors]);
  const laserPoints = trace.points.map(toSvgPoint).join(" ");

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current);
    },
    [],
  );

  const rotateAt = useCallback(
    (row: number, col: number) => {
      if (accessState === "granted") return;

      setMirrors((currentMirrors) => {
        const nextMirrors = currentMirrors.map((mirror) =>
          mirror.row === row && mirror.col === col ? { ...mirror, orientation: rotateMirror(mirror.orientation) } : mirror,
        );
        if (traceLaser(nextMirrors).solved) {
          setAccessState("granted");
          successTimerRef.current = window.setTimeout(() => onSuccess(), SUCCESS_DELAY_MS);
        }
        return nextMirrors;
      });
    },
    [accessState, onSuccess],
  );

  const mirrorByKey = useMemo(() => new Map(mirrors.map((mirror) => [mirrorKey(mirror), mirror])), [mirrors]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-cyan-300/20 bg-zinc-950/90 text-zinc-100 shadow-[0_0_95px_rgba(34,211,238,0.15)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="optical-bypass-title"
      >
        <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-cyan-950/30 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.34em] text-cyan-300/80">Optical Reflection Bypass</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="optical-bypass-title" className="text-2xl font-semibold tracking-wide text-zinc-50">
                光学反射链路
              </h2>
              <p className="mt-1 text-sm text-zinc-500">旋转镜面，让激光经过全部镜子并射入右下角接收器。</p>
            </div>
            <div
              className={`rounded border bg-black/35 px-3 py-2 text-right font-mono text-xs transition ${
                trace.solved
                  ? "border-cyan-300/80 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.35)]"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              <p>{trace.solved ? "OPTICAL LINKED" : "SIGNAL BLOCKED"}</p>
              <p className="text-[10px] text-zinc-500">MIRRORS::{mirrors.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-lg border border-cyan-400/20 bg-black/55 p-3 shadow-[inset_0_0_34px_rgba(8,145,178,0.14)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[length:100%_33.333%,33.333%_100%]" />
            <svg className="pointer-events-none absolute inset-3 z-20" viewBox="0 0 300 300" aria-hidden="true">
              <polyline points={laserPoints} fill="none" stroke="rgba(14,165,233,0.18)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <motion.polyline
                key={laserPoints + String(trace.solved)}
                points={laserPoints}
                fill="none"
                stroke={trace.solved ? "rgb(103,232,249)" : "rgb(34,211,238)"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: trace.solved ? 1 : 0.72 }}
                transition={{ duration: trace.solved ? 0.9 : 0.25, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.95))" }}
              />
            </svg>

            <div className="relative z-10 grid h-full grid-cols-3 grid-rows-3 gap-2">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                const row = Math.floor(index / GRID_SIZE);
                const col = index % GRID_SIZE;
                const mirror = mirrorByKey.get(mirrorKey({ row, col }));
                const isStart = samePoint({ row, col }, START);
                const isReceiver = samePoint({ row, col }, RECEIVER);

                return mirror ? (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    onClick={() => rotateAt(row, col)}
                    disabled={accessState === "granted"}
                    className="flex items-center justify-center rounded-md border border-cyan-300/35 bg-zinc-950/80 text-5xl text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-950/30 hover:shadow-[0_0_24px_rgba(34,211,238,0.24)] disabled:cursor-not-allowed disabled:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                    aria-label={`旋转 ${cellLabel(row, col)} 镜面，当前方向 ${mirror.orientation}`}
                  >
                    <span className="drop-shadow-[0_0_12px_rgba(103,232,249,0.9)]">{mirror.orientation}</span>
                  </button>
                ) : (
                  <div
                    key={`${row}-${col}`}
                    className={`flex items-center justify-center rounded-md border font-mono text-xs ${
                      isStart
                        ? "border-emerald-300/50 bg-emerald-950/25 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.18)]"
                        : isReceiver
                          ? "border-cyan-300/50 bg-cyan-950/25 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-700"
                    }`}
                    aria-label={cellLabel(row, col)}
                  >
                    {isStart ? "LASER →" : isReceiver ? "RX" : "·"}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
            <p className="font-mono text-xs text-zinc-500" aria-live="polite">
              {trace.solved ? "光路已贯通：接收器正在确认访问密钥。" : "点击镜子旋转 90°，链路必须经过全部镜面节点。"}
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
