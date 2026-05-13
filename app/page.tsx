"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MathMinigame } from "@/components/MathMinigame";
import { SafeGrid } from "@/components/SafeGrid";
import { WaveformMinigame } from "@/components/WaveformMinigame";
import { generateLootBoard } from "@/lib/loot-sim/placement";
import type { PlacedLoot } from "@/lib/loot-sim/types";

type ViewState = "GRID_VIEW" | "DECRYPT_VIEW";
type DecryptMode = "WAVEFORM" | "MATH";

const BACKGROUND_SOUND_SRC = encodeURI("/sounds/搜索背景音.mp3");
const RED_LOOT_SOUND_SRC = encodeURI("/sounds/出大货音效.mp3");

function pickDecryptMode(): DecryptMode {
  return Math.random() < 0.5 ? "WAVEFORM" : "MATH";
}

export default function Home() {
  const [board, setBoard] = useState<PlacedLoot[] | null>(null);
  const [viewState, setViewState] = useState<ViewState>("DECRYPT_VIEW");
  const [decryptMode, setDecryptMode] = useState<DecryptMode>(() => pickDecryptMode());
  const [revealedLootIds, setRevealedLootIds] = useState<Set<string>>(() => new Set());
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const redLootAudioRef = useRef<HTMLAudioElement | null>(null);

  const playBackgroundSound = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const playRedLootSound = useCallback(() => {
    const audio = redLootAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const startNewRun = useCallback(() => {
    setBoard(generateLootBoard());
    setRevealedLootIds(new Set());
    setDecryptMode(pickDecryptMode());
    setViewState("DECRYPT_VIEW");
    playBackgroundSound();
  }, [playBackgroundSound]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startNewRun();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [startNewRun]);

  const revealLoot = useCallback(
    (loot: PlacedLoot) => {
      setRevealedLootIds((prev) => {
        if (prev.has(loot.instanceId)) return prev;
        const next = new Set(prev);
        next.add(loot.instanceId);
        return next;
      });
      if (loot.def.quality === "red") playRedLootSound();
    },
    [playRedLootSound],
  );

  const unlockSafe = useCallback(() => {
    setViewState("GRID_VIEW");
  }, []);

  const cancelDecrypt = useCallback(() => {
    setViewState("GRID_VIEW");
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-black p-6 text-zinc-200">
      <audio ref={backgroundAudioRef} src={BACKGROUND_SOUND_SRC} preload="auto" loop />
      <audio ref={redLootAudioRef} src={RED_LOOT_SOUND_SRC} preload="auto" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.12),transparent_34%),linear-gradient(135deg,rgba(63,63,70,0.08),transparent_45%)]" />

      <div className="relative flex flex-col items-center gap-3">
        <p className="text-sm text-zinc-500">4×4 摸金模拟器 · 每局先完成随机解密，再搜索保险箱内物品</p>
        <button
          type="button"
          onClick={startNewRun}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          新的一局
        </button>
      </div>

      <div className="relative">
        {!board ? (
          <p className="text-sm text-zinc-500">生成布局中…</p>
        ) : (
          <SafeGrid
            key={board.map((loot) => loot.instanceId).join("|")}
            board={board}
            revealedLootIds={revealedLootIds}
            disabled={viewState === "DECRYPT_VIEW"}
            onSearchComplete={revealLoot}
            onInstantReveal={revealLoot}
          />
        )}
      </div>

      {viewState === "DECRYPT_VIEW" && board && decryptMode === "WAVEFORM" ? (
        <WaveformMinigame
          key={`waveform-${board.map((loot) => loot.instanceId).join("|")}`}
          title="保险箱波形同步"
          subtitle="先破解锁芯频谱，获得本局打开并搜索保险箱的权限。破解难度固定，不受物品品质影响。"
          onSuccess={unlockSafe}
          onCancel={cancelDecrypt}
        />
      ) : null}

      {viewState === "DECRYPT_VIEW" && board && decryptMode === "MATH" ? (
        <MathMinigame
          key={`math-${board.map((loot) => loot.instanceId).join("|")}`}
          onSuccess={unlockSafe}
          onCancel={cancelDecrypt}
        />
      ) : null}
    </main>
  );
}
