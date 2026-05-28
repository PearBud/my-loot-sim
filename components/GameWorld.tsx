"use client";

import type { TacticalInventoryItem } from "@/components/TacticalInventory";
import { TileMap, useMovement } from "@/hooks/useMovement";

type GameWorldProps = {
  enabled: boolean;
  onPickupSafe: (item: TacticalInventoryItem) => void;
};

const TILE_SIZE = 48;

const INITIAL_MAP: TileMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 2, 1, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 2, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
  [1, 0, 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function tileClass(tile: number) {
  if (tile === 1) return "border-zinc-600 bg-zinc-700 shadow-[inset_0_0_14px_rgba(0,0,0,0.55)]";
  if (tile === 2) return "border-red-400/60 bg-red-950/65 shadow-[0_0_18px_rgba(248,113,113,0.35),inset_0_0_12px_rgba(0,0,0,0.55)]";
  return "border-emerald-950/70 bg-[linear-gradient(135deg,#14532d,#166534_48%,#14532d)] shadow-[inset_0_0_10px_rgba(0,0,0,0.24)]";
}

function tileContent(tile: number) {
  if (tile === 1) return "▧";
  if (tile === 2) return "▣";
  return "";
}

export function GameWorld({ enabled, onPickupSafe }: GameWorldProps) {
  const { tileMap, charPos, adjacentSafe } = useMovement({
    enabled,
    initialMap: INITIAL_MAP,
    initialPosition: { x: 1, y: 1 },
    onPickupSafe,
  });

  return (
    <section className="relative flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.34em] text-emerald-300/70">Pixel Tactical Field</p>
        <h1 className="mt-1 text-3xl font-black tracking-wide text-zinc-100">2D 战术探索地图</h1>
        <p className="mt-2 text-sm text-zinc-500">W/A/S/D 或方向键移动 · 靠近保险箱后按 E 拾取 · Tab 打开背包</p>
      </div>

      <div className="relative rounded-xl border-4 border-zinc-800 bg-zinc-950 p-3 shadow-[0_0_80px_rgba(20,83,45,0.24)] [image-rendering:pixelated]">
        <div className="pointer-events-none absolute inset-3 z-20 bg-[radial-gradient(circle_at_50%_45%,transparent_45%,rgba(0,0,0,0.34)),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:100%_100%,100%_4px]" />
        <div
          className="relative grid overflow-hidden rounded-md border border-zinc-900 bg-emerald-950/30"
          style={{ gridTemplateColumns: `repeat(16, ${TILE_SIZE}px)` }}
        >
          {tileMap.flatMap((row, y) =>
            row.map((tile, x) => {
              const isPlayer = charPos.x === x && charPos.y === y;
              const isAdjacentSafe = adjacentSafe?.x === x && adjacentSafe.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  className={`relative flex items-center justify-center border text-2xl font-black ${tileClass(tile)} ${
                    isAdjacentSafe ? "ring-2 ring-amber-300 ring-inset" : ""
                  }`}
                  style={{ width: TILE_SIZE, height: TILE_SIZE }}
                >
                  <span className={tile === 2 ? "text-red-200 drop-shadow-[0_0_10px_rgba(248,113,113,0.9)]" : "text-zinc-500"}>{tileContent(tile)}</span>
                  {isPlayer ? (
                    <span className="absolute inset-0 z-10 flex items-center justify-center text-3xl drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]" aria-label="玩家角色">
                      🧍
                    </span>
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="min-h-10 rounded-md border border-zinc-800 bg-black/45 px-4 py-2 font-mono text-sm text-zinc-400">
        {adjacentSafe ? (
          <span className="text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]">[E] 拾取保险箱 · 坐标 X{adjacentSafe.x} / Y{adjacentSafe.y}</span>
        ) : enabled ? (
          <span>探索中：寻找发红光的战术保险箱。</span>
        ) : (
          <span>界面锁定：背包或解密界面开启中。</span>
        )}
      </div>
    </section>
  );
}
