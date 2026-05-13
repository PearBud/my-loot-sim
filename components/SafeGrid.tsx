"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { CELL_PX, craftedItemUrl, GRID_SIZE } from "@/lib/loot-sim/config";
import type { LootQuality, PlacedLoot } from "@/lib/loot-sim/types";

const DEBUG_INSTANT_REVEAL = false;
const GRID_GAP_PX = 1;
const GRID_FRAME_PAD_TOTAL_PX = 2;

const GLOW_CLASS: Record<LootQuality, string> = {
  red: "shadow-[0_0_36px_14px_rgba(239,68,68,0.92),0_0_88px_40px_rgba(185,28,28,0.55),0_0_140px_60px_rgba(127,29,29,0.35)]",
  gold: "shadow-[0_0_28px_10px_rgba(250,204,21,0.88),0_0_72px_32px_rgba(202,138,4,0.45)]",
  purple: "shadow-[0_0_24px_8px_rgba(168,85,247,0.88),0_0_64px_26px_rgba(147,51,234,0.5),0_0_110px_44px_rgba(126,34,206,0.3)]",
  blue: "shadow-[0_0_12px_4px_rgba(59,130,246,0.55),0_0_28px_12px_rgba(37,99,235,0.28)]",
};

type SafeGridProps = {
  board: PlacedLoot[];
  revealedLootIds: Set<string>;
  disabled?: boolean;
  onSearchComplete: (loot: PlacedLoot) => void;
  onInstantReveal?: (loot: PlacedLoot) => void;
};

function findLootAt(board: PlacedLoot[], row: number, col: number): PlacedLoot | undefined {
  return board.find(
    (p) =>
      row >= p.originRow &&
      row < p.originRow + p.def.height &&
      col >= p.originCol &&
      col < p.originCol + p.def.width,
  );
}

function buildOccupiedKeys(board: PlacedLoot[]): Set<string> {
  const keys = new Set<string>();
  for (const p of board) {
    for (let r = 0; r < p.def.height; r++) {
      for (let c = 0; c < p.def.width; c++) {
        keys.add(`${p.originRow + r},${p.originCol + c}`);
      }
    }
  }
  return keys;
}

function magnifierOrbitKeyframes(radiusPx: number) {
  const c = 0.70710678 * radiusPx;
  return {
    x: [radiusPx, c, 0, -c, -radiusPx, -c, 0, c, radiusPx],
    y: [0, c, radiusPx, c, 0, -c, -radiusPx, -c, 0],
  };
}

function lootCellBoxPx(def: { width: number; height: number }) {
  const w = def.width * CELL_PX + (def.width - 1) * GRID_GAP_PX;
  const h = def.height * CELL_PX + (def.height - 1) * GRID_GAP_PX;
  return { w, h };
}

function lootImageBoxPx(def: { width: number; height: number }) {
  const { w, h } = lootCellBoxPx(def);
  return { w: Math.round(w * 0.8), h: Math.round(h * 0.8) };
}

export function SafeGrid({ board, revealedLootIds, disabled = false, onSearchComplete, onInstantReveal }: SafeGridProps) {
  const [showEmpty, setShowEmpty] = useState(false);
  const [searchingLootId, setSearchingLootId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearTimer();
    },
    [clearTimer],
  );

  const beginSearch = useCallback(
    (loot: PlacedLoot) => {
      clearTimer();
      setShowEmpty(false);

      if (DEBUG_INSTANT_REVEAL) {
        setSearchingLootId(null);
        onInstantReveal?.(loot);
        return;
      }

      setSearchingLootId(loot.instanceId);
      timerRef.current = setTimeout(() => {
        setSearchingLootId((currentId) => (currentId === loot.instanceId ? null : currentId));
        timerRef.current = null;
        onSearchComplete(loot);
      }, loot.def.searchSeconds * 1000);
    },
    [clearTimer, onInstantReveal, onSearchComplete],
  );

  const onGridPointerUp = useCallback(
    (row: number, col: number) => {
      if (disabled) return;

      const loot = findLootAt(board, row, col);
      if (!loot) {
        setShowEmpty(true);
        return;
      }

      if (revealedLootIds.has(loot.instanceId)) return;
      if (!DEBUG_INSTANT_REVEAL && searchingLootId && searchingLootId !== loot.instanceId) return;
      if (searchingLootId !== loot.instanceId) beginSearch(loot);
    },
    [beginSearch, board, disabled, revealedLootIds, searchingLootId],
  );

  const occupied = useMemo(() => buildOccupiedKeys(board), [board]);
  const gridOuterStyle = {
    width: GRID_SIZE * CELL_PX + (GRID_SIZE - 1) * GRID_GAP_PX + GRID_FRAME_PAD_TOTAL_PX,
    height: GRID_SIZE * CELL_PX + (GRID_SIZE - 1) * GRID_GAP_PX + GRID_FRAME_PAD_TOTAL_PX,
  } as const;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid gap-px rounded-sm bg-zinc-700 p-px shadow-[0_0_60px_rgba(24,24,27,0.75)]"
        style={{
          ...gridOuterStyle,
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_PX}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_PX}px)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => {
          const row = Math.floor(idx / GRID_SIZE);
          const col = idx % GRID_SIZE;
          if (occupied.has(`${row},${col}`)) return null;
          return (
            <button
              key={`empty-${row}-${col}`}
              type="button"
              disabled={disabled}
              className="bg-black hover:bg-zinc-950/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-80"
              style={{ gridColumn: col + 1, gridRow: row + 1 }}
              aria-label={`空格 ${row + 1} 行 ${col + 1} 列`}
              onClick={() => onGridPointerUp(row, col)}
            />
          );
        })}

        {board.map((loot) => {
          const { def, originRow, originCol, instanceId } = loot;
          const revealed = revealedLootIds.has(instanceId);
          const searching = searchingLootId === instanceId;
          const glow = revealed ? GLOW_CLASS[def.quality] : "";
          const z = searching || revealed ? "z-10" : "z-[1]";
          const imgBox = lootImageBoxPx(def);
          const cellBox = lootCellBoxPx(def);
          const orbitRadius = Math.max(4, Math.min(9, Math.round(Math.min(cellBox.w, cellBox.h) * 0.065)));
          const iconSize = Math.max(26, Math.min(40, Math.round(Math.min(cellBox.w, cellBox.h) * 0.22)));
          const qualityFocus =
            def.quality === "red"
              ? "focus-visible:outline-red-400/80"
              : def.quality === "gold"
                ? "focus-visible:outline-amber-300/80"
                : def.quality === "purple"
                  ? "focus-visible:outline-purple-400/80"
                  : "focus-visible:outline-blue-400/80";

          return (
            <button
              key={instanceId}
              type="button"
              disabled={disabled}
              style={{ gridColumn: `${originCol + 1} / span ${def.width}`, gridRow: `${originRow + 1} / span ${def.height}` }}
              className={`relative flex min-h-0 min-w-0 cursor-pointer select-none items-center justify-center overflow-hidden border-0 bg-black p-0 text-left ${z} ${glow} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-80 ${qualityFocus}`}
              aria-label={searching ? `${def.name}（搜索中）` : revealed ? `${def.name}（已鉴定）` : `${def.name}（剪影）`}
              onClick={() => onGridPointerUp(originRow, originCol)}
            >
              {searching && !DEBUG_INSTANT_REVEAL && (
                <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                  <motion.div
                    className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]"
                    style={{ rotate: "-28deg" }}
                    initial={false}
                    animate={magnifierOrbitKeyframes(orbitRadius)}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  >
                    <Search width={iconSize} height={iconSize} strokeWidth={2.25} aria-hidden />
                  </motion.div>
                </div>
              )}
              <div
                className={`relative z-[1] shrink-0 overflow-hidden ${revealed ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]" : ""}`}
                style={{ width: imgBox.w, height: imgBox.h, minWidth: imgBox.w, minHeight: imgBox.h }}
              >
                <Image
                  key={`${instanceId}-silhouette`}
                  src={craftedItemUrl(def.imageFile)}
                  alt=""
                  fill
                  sizes={`${Math.max(imgBox.w, imgBox.h)}px`}
                  priority
                  loading="eager"
                  unoptimized
                  draggable={false}
                  aria-hidden
                  className="object-contain brightness-0"
                />
                {revealed && (
                  <Image
                    key={`${instanceId}-revealed`}
                    src={craftedItemUrl(def.imageFile)}
                    alt={def.name}
                    fill
                    sizes={`${Math.max(imgBox.w, imgBox.h)}px`}
                    priority
                    loading="eager"
                    unoptimized
                    draggable={false}
                    className="object-contain"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p
        className={`min-h-[1.5rem] text-center text-sm text-zinc-500 transition-opacity duration-200 ${
          showEmpty ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        {showEmpty ? "空空如也" : "\u00a0"}
      </p>
    </div>
  );
}
