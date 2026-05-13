"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { CELL_PX, craftedItemUrl, GRID_SIZE } from "@/lib/loot-sim/config";
import { generateLootBoard } from "@/lib/loot-sim/placement";
import type { LootQuality, PlacedLoot } from "@/lib/loot-sim/types";

/**
 * 调试：为 true 时跳过搜索计时与放大镜动画，点击剪影立即显示原图。
 */
const DEBUG_INSTANT_REVEAL = false;

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

/** 搜索完成后的品质光晕：红最强 → 蓝最弱 */
const GLOW_CLASS: Record<LootQuality, string> = {
  red: "shadow-[0_0_36px_14px_rgba(239,68,68,0.92),0_0_88px_40px_rgba(185,28,28,0.55),0_0_140px_60px_rgba(127,29,29,0.35)]",
  gold: "shadow-[0_0_28px_10px_rgba(250,204,21,0.88),0_0_72px_32px_rgba(202,138,4,0.45)]",
  purple: "shadow-[0_0_24px_8px_rgba(168,85,247,0.88),0_0_64px_26px_rgba(147,51,234,0.5),0_0_110px_44px_rgba(126,34,206,0.3)]",
  blue: "shadow-[0_0_12px_4px_rgba(59,130,246,0.55),0_0_28px_12px_rgba(37,99,235,0.28)]",
};

/** 放大镜在平面上绕物品中心的小圆周平移（图标朝向固定） */
function magnifierOrbitKeyframes(radiusPx: number) {
  const c = 0.70710678 * radiusPx;
  return {
    x: [radiusPx, c, 0, -c, -radiusPx, -c, 0, c, radiusPx],
    y: [0, c, radiusPx, c, 0, -c, -radiusPx, -c, 0],
  };
}

const GRID_GAP_PX = 1;
const BACKGROUND_SOUND_SRC = encodeURI("/sounds/搜索背景音.mp3");
const RED_LOOT_SOUND_SRC = encodeURI("/sounds/出大货音效.mp3");
/** 与外层 `p-px` 一致：border-box 下左右各 1px，总宽需 +2，否则轨道被挤扁、最右/最下格线消失 */
const GRID_FRAME_PAD_TOTAL_PX = 2;

/** 物品格区像素尺寸（含格子间 gap），避免 flex + 百分比 + fill 造成高度为 0 */
function lootCellBoxPx(def: { width: number; height: number }) {
  const w = def.width * CELL_PX + (def.width - 1) * GRID_GAP_PX;
  const h = def.height * CELL_PX + (def.height - 1) * GRID_GAP_PX;
  return { w, h };
}

function lootImageBoxPx(def: { width: number; height: number }) {
  const { w, h } = lootCellBoxPx(def);
  return { w: Math.round(w * 0.8), h: Math.round(h * 0.8) };
}

export default function Home() {
  const [board, setBoard] = useState<PlacedLoot[] | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const [searchingLootId, setSearchingLootId] = useState<string | null>(null);
  const [revealedLootIds, setRevealedLootIds] = useState<Set<string>>(() => new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const redLootAudioRef = useRef<HTMLAudioElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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
    clearTimer();
    setBoard(generateLootBoard());
    setSearchingLootId(null);
    setRevealedLootIds(new Set());
    setShowEmpty(false);
    playBackgroundSound();
  }, [clearTimer, playBackgroundSound]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      startNewRun();
    }, 0);
    return () => {
      window.clearTimeout(t);
    };
  }, [startNewRun]);

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

      const id = loot.instanceId;

      if (DEBUG_INSTANT_REVEAL) {
        setSearchingLootId(null);
        setRevealedLootIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        if (loot.def.quality === "red") playRedLootSound();
        return;
      }

      setSearchingLootId(id);

      timerRef.current = setTimeout(() => {
        setSearchingLootId((currentId) => (currentId === id ? null : currentId));
        setRevealedLootIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        if (loot.def.quality === "red") playRedLootSound();
        timerRef.current = null;
      }, loot.def.searchSeconds * 1000);
    },
    [clearTimer, playRedLootSound],
  );

  const onGridPointerUp = useCallback(
    (row: number, col: number) => {
      if (!board) return;
      const loot = findLootAt(board, row, col);
      if (!loot) {
        setShowEmpty(true);
        return;
      }

      const revealed = revealedLootIds.has(loot.instanceId);
      if (revealed) return;
      if (!DEBUG_INSTANT_REVEAL && searchingLootId && searchingLootId !== loot.instanceId) return;
      if (searchingLootId !== loot.instanceId) beginSearch(loot);
    },
    [board, revealedLootIds, searchingLootId, beginSearch],
  );

  const occupied = board ? buildOccupiedKeys(board) : new Set<string>();

  const gridOuterStyle = {
    width: GRID_SIZE * CELL_PX + (GRID_SIZE - 1) * GRID_GAP_PX + GRID_FRAME_PAD_TOTAL_PX,
    height: GRID_SIZE * CELL_PX + (GRID_SIZE - 1) * GRID_GAP_PX + GRID_FRAME_PAD_TOTAL_PX,
  } as const;

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6 text-zinc-200">
      <audio ref={backgroundAudioRef} src={BACKGROUND_SOUND_SRC} preload="auto" loop />
      <audio ref={redLootAudioRef} src={RED_LOOT_SOUND_SRC} preload="auto" />
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-zinc-500">
          4×4 摸金模拟器
          {DEBUG_INSTANT_REVEAL ? " · 调试模式：点击剪影立即显示原图" : " · 点击剪影开始搜索"}
        </p>
        <button
          type="button"
          onClick={startNewRun}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          新的一局
        </button>
      </div>

      {!board ? (
        <p className="text-sm text-zinc-500">生成布局中…</p>
      ) : (
        <div
          className="grid gap-px bg-zinc-700 p-px rounded-sm"
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
                className="bg-black hover:bg-zinc-950/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500 focus-visible:outline-offset-2"
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
            const gc = `${originCol + 1} / span ${def.width}`;
            const gr = `${originRow + 1} / span ${def.height}`;
            const src = craftedItemUrl(def.imageFile);
            const glow = revealed ? GLOW_CLASS[def.quality] : "";
            const z = searching || revealed ? "z-10" : "z-[1]";

            const imgBox = lootImageBoxPx(def);
            const cellBox = lootCellBoxPx(def);
            const orbitRadius = Math.max(4, Math.min(9, Math.round(Math.min(cellBox.w, cellBox.h) * 0.065)));
            const iconSize = Math.max(26, Math.min(40, Math.round(Math.min(cellBox.w, cellBox.h) * 0.22)));

            const inner = (
              <>
                {searching && !DEBUG_INSTANT_REVEAL && (
                  <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                    <motion.div
                      className="text-white"
                      style={{ rotate: "-28deg" }}
                      initial={false}
                      animate={magnifierOrbitKeyframes(orbitRadius)}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Search width={iconSize} height={iconSize} strokeWidth={2.25} aria-hidden />
                    </motion.div>
                  </div>
                )}
                <div
                  className={
                    "relative z-[1] shrink-0 overflow-hidden " +
                    (revealed ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]" : "")
                  }
                  style={{
                    width: imgBox.w,
                    height: imgBox.h,
                    minWidth: imgBox.w,
                    minHeight: imgBox.h,
                  }}
                >
                  <Image
                    key={`${instanceId}-silhouette`}
                    src={src}
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
                      src={src}
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
              </>
            );

            const baseBtn =
              `relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-black ` +
              `border-0 p-0 text-left cursor-pointer select-none ${z} ${glow} ` +
              `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ` +
              (def.quality === "red"
                ? "focus-visible:outline-red-400/80"
                : def.quality === "gold"
                  ? "focus-visible:outline-amber-300/80"
                  : def.quality === "purple"
                    ? "focus-visible:outline-purple-400/80"
                    : "focus-visible:outline-blue-400/80");

            const style = { gridColumn: gc, gridRow: gr } as const;

            return (
              <button
                key={instanceId}
                type="button"
                style={style}
                className={baseBtn}
                aria-label={
                  searching ? `${def.name}（搜索中）` : revealed ? `${def.name}（已鉴定）` : `${def.name}（剪影）`
                }
                onClick={() => onGridPointerUp(originRow, originCol)}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}

      <p
        className={`min-h-[1.5rem] text-center text-sm text-zinc-500 transition-opacity duration-200 ${
          showEmpty ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        {showEmpty ? "空空如也" : "\u00a0"}
      </p>
    </main>
  );
}
