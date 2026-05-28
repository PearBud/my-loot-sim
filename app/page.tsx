"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BinaryHackerMinigame } from "@/components/BinaryHackerMinigame";
import { GameWorld } from "@/components/GameWorld";
import { LogicGridMinigame } from "@/components/LogicGridMinigame";
import { MathMinigame } from "@/components/MathMinigame";
import { OpticalBypassMinigame } from "@/components/OpticalBypassMinigame";
import { SafeGrid } from "@/components/SafeGrid";
import { TacticalInventory, type TacticalInventoryItem } from "@/components/TacticalInventory";
import { WaveformMinigame } from "@/components/WaveformMinigame";
import { generateLootBoard } from "@/lib/loot-sim/placement";
import type { LootQuality, PlacedLoot } from "@/lib/loot-sim/types";

type GameMode = "EXPLORING" | "INVENTORY" | "DECRYPTING" | "SAFE_GRID";
type DecryptMode = "WAVEFORM" | "MATH" | "LOGIC" | "BINARY" | "OPTICAL";

const BACKGROUND_SOUND_SRC = encodeURI("/sounds/搜索背景音.mp3");
const DECRYPT_MODES: DecryptMode[] = ["WAVEFORM", "MATH", "LOGIC", "BINARY", "OPTICAL"];

const INITIAL_INVENTORY: TacticalInventoryItem[] = [
  { id: "starter-safe-001", name: "初始战术保险箱", type: "safe", rarity: "blue", icon: "▣", description: "行动开始前配发的低风险保险箱，可用于测试解密链路。", width: 1, height: 1 },
];

function pickDecryptMode(): DecryptMode {
  return DECRYPT_MODES[Math.floor(Math.random() * DECRYPT_MODES.length)];
}

function lootToInventoryItem(loot: PlacedLoot): TacticalInventoryItem {
  return {
    id: `loot-${loot.instanceId}`,
    name: loot.def.name,
    type: "loot",
    rarity: loot.def.quality,
    icon: "◆",
    description: `${loot.def.quality.toUpperCase()} 品质战利品，占用 ${loot.def.width}×${loot.def.height} 格。`,
    width: loot.def.width,
    height: loot.def.height,
    imageFile: loot.def.imageFile,
  };
}

function rarityRank(quality: LootQuality) {
  const order: Record<LootQuality, number> = { red: 0, gold: 1, purple: 2, blue: 3 };
  return order[quality];
}

function sortInventory(items: TacticalInventoryItem[]) {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "safe" ? -1 : 1;
    const rarityDiff = rarityRank(a.rarity) - rarityRank(b.rarity);
    if (rarityDiff !== 0) return rarityDiff;
    const aArea = (a.width ?? 1) * (a.height ?? 1);
    const bArea = (b.width ?? 1) * (b.height ?? 1);
    return bArea - aArea || a.name.localeCompare(b.name, "zh-Hans-CN");
  });
}

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>("EXPLORING");
  const [inventory, setInventory] = useState<TacticalInventoryItem[]>(INITIAL_INVENTORY);
  const [activeSafeId, setActiveSafeId] = useState<string | null>(null);
  const [decryptMode, setDecryptMode] = useState<DecryptMode>(() => pickDecryptMode());
  const [safeBoard, setSafeBoard] = useState<PlacedLoot[]>(() => generateLootBoard());
  const [revealedLootIds, setRevealedLootIds] = useState<Set<string>>(() => new Set());
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  const playBackgroundSound = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.loop = true;
    void audio.play().catch(() => undefined);
  }, []);

  const stopBackgroundSound = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  useEffect(() => {
    if (gameMode === "EXPLORING" || gameMode === "SAFE_GRID") playBackgroundSound();
    else stopBackgroundSound();
  }, [gameMode, playBackgroundSound, stopBackgroundSound]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        setGameMode((currentMode) => (currentMode === "INVENTORY" ? "EXPLORING" : currentMode === "EXPLORING" ? "INVENTORY" : currentMode));
        return;
      }
      if (event.key === "Escape") setGameMode((currentMode) => (currentMode === "INVENTORY" ? "EXPLORING" : currentMode));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pickupSafe = useCallback((item: TacticalInventoryItem) => {
    setInventory((currentInventory) => sortInventory([...currentInventory, { ...item, width: 1, height: 1 }]));
  }, []);

  const openInventory = useCallback(() => setGameMode("INVENTORY"), []);
  const closeInventory = useCallback(() => setGameMode("EXPLORING"), []);

  const openSafeFromInventory = useCallback((safeId: string) => {
    setActiveSafeId(safeId);
    setDecryptMode(pickDecryptMode());
    setGameMode("DECRYPTING");
  }, []);

  const discardInventoryItem = useCallback((itemId: string) => {
    setInventory((currentInventory) => currentInventory.filter((item) => item.id !== itemId));
  }, []);

  const finishDecrypt = useCallback(() => {
    setSafeBoard(generateLootBoard());
    setRevealedLootIds(new Set());
    setGameMode("SAFE_GRID");
  }, []);

  const cancelDecrypt = useCallback(() => setGameMode("INVENTORY"), []);

  const collectLoot = useCallback((loot: PlacedLoot) => {
    setRevealedLootIds((currentIds) => {
      if (currentIds.has(loot.instanceId)) return currentIds;
      const nextIds = new Set(currentIds);
      nextIds.add(loot.instanceId);
      return nextIds;
    });
    setInventory((currentInventory) => {
      const withoutSafe = activeSafeId ? currentInventory.filter((item) => item.id !== activeSafeId) : currentInventory;
      if (withoutSafe.some((item) => item.id === `loot-${loot.instanceId}`)) return withoutSafe;
      return sortInventory([...withoutSafe, lootToInventoryItem(loot)]);
    });
  }, [activeSafeId]);

  const returnToInventoryFromSafeGrid = useCallback(() => {
    setActiveSafeId(null);
    setGameMode("INVENTORY");
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 p-6 text-zinc-200">
      <audio ref={backgroundAudioRef} src={BACKGROUND_SOUND_SRC} preload="auto" loop />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(22,163,74,0.16),transparent_34%),linear-gradient(135deg,rgba(63,63,70,0.18),transparent_46%)]" />

      <div className="relative z-10">
        <GameWorld enabled={gameMode === "EXPLORING"} onPickupSafe={pickupSafe} />
      </div>

      <button type="button" onClick={openInventory} className="fixed bottom-8 right-8 z-30 rounded-2xl border-2 border-emerald-400/45 bg-zinc-950/85 px-5 py-4 font-mono text-sm text-emerald-200 shadow-[0_0_34px_rgba(52,211,153,0.25)] backdrop-blur transition hover:border-emerald-300 hover:bg-emerald-950/40 hover:shadow-[0_0_46px_rgba(52,211,153,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300" aria-label="打开战术背包">
        <span className="mr-2 text-xl">▦</span>背包 [{inventory.length}]
      </button>

      {gameMode === "INVENTORY" ? <TacticalInventory items={inventory} onClose={closeInventory} onOpenSafe={openSafeFromInventory} onDiscardItem={discardInventoryItem} /> : null}

      {gameMode === "SAFE_GRID" ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 backdrop-blur-md">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.34em] text-emerald-300/70">Safe Content Search</p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-100">保险箱搜索</h2>
            <p className="mt-1 text-sm text-zinc-500">点击剪影进行搜索，搜出的物品会按尺寸进入背包。</p>
          </div>
          <SafeGrid board={safeBoard} revealedLootIds={revealedLootIds} onSearchComplete={collectLoot} onInstantReveal={collectLoot} />
          <button type="button" onClick={returnToInventoryFromSafeGrid} className="rounded-md border border-emerald-400/40 bg-emerald-950/25 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-900/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300">返回背包</button>
        </div>
      ) : null}

      {gameMode === "DECRYPTING" && decryptMode === "WAVEFORM" ? <WaveformMinigame title="保险箱波形同步" subtitle="破解后进入保险箱搜索界面，搜索出的物品将占用背包对应格子。" onSuccess={finishDecrypt} onCancel={cancelDecrypt} /> : null}
      {gameMode === "DECRYPTING" && decryptMode === "MATH" ? <MathMinigame onSuccess={finishDecrypt} onCancel={cancelDecrypt} /> : null}
      {gameMode === "DECRYPTING" && decryptMode === "LOGIC" ? <LogicGridMinigame onSuccess={finishDecrypt} onCancel={cancelDecrypt} /> : null}
      {gameMode === "DECRYPTING" && decryptMode === "BINARY" ? <BinaryHackerMinigame onSuccess={finishDecrypt} onCancel={cancelDecrypt} /> : null}
      {gameMode === "DECRYPTING" && decryptMode === "OPTICAL" ? <OpticalBypassMinigame onSuccess={finishDecrypt} onCancel={cancelDecrypt} /> : null}
    </main>
  );
}
