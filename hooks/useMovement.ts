"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TacticalInventoryItem } from "@/components/TacticalInventory";

export type TileType = 0 | 1 | 2;
export type TileMap = TileType[][];
export type GridPosition = { x: number; y: number };

type UseMovementOptions = {
  enabled: boolean;
  initialMap: TileMap;
  initialPosition: GridPosition;
  onPickupSafe: (item: TacticalInventoryItem) => void;
};

const SAFE_RARITIES: TacticalInventoryItem["rarity"][] = ["blue", "purple", "gold", "red"];

function isInsideMap(map: TileMap, position: GridPosition) {
  return position.y >= 0 && position.y < map.length && position.x >= 0 && position.x < (map[position.y]?.length ?? 0);
}

function isAdjacent(a: GridPosition, b: GridPosition) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function createSafeItem(position: GridPosition): TacticalInventoryItem {
  const rarity = SAFE_RARITIES[Math.floor(Math.random() * SAFE_RARITIES.length)];
  const rarityName = rarity === "red" ? "机密" : rarity === "gold" ? "贵重" : rarity === "purple" ? "加密" : "普通";

  return {
    id: `map-safe-${position.x}-${position.y}-${Date.now()}`,
    name: `${rarityName}战术保险箱`,
    type: "safe",
    rarity,
    icon: "▣",
    description: `从地图坐标 X${position.x} / Y${position.y} 回收的 ${rarityName} 保险箱。`,
  };
}

export function useMovement({ enabled, initialMap, initialPosition, onPickupSafe }: UseMovementOptions) {
  const [tileMap, setTileMap] = useState<TileMap>(() => initialMap.map((row) => [...row]));
  const [charPos, setCharPos] = useState<GridPosition>(initialPosition);

  const adjacentSafe = useMemo(() => {
    for (let y = 0; y < tileMap.length; y += 1) {
      for (let x = 0; x < tileMap[y].length; x += 1) {
        if (tileMap[y][x] === 2 && isAdjacent(charPos, { x, y })) {
          return { x, y };
        }
      }
    }
    return null;
  }, [charPos, tileMap]);

  const moveBy = useCallback(
    (delta: GridPosition) => {
      setCharPos((currentPosition) => {
        const nextPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };
        if (!isInsideMap(tileMap, nextPosition)) return currentPosition;
        if (tileMap[nextPosition.y][nextPosition.x] === 1) return currentPosition;
        return nextPosition;
      });
    },
    [tileMap],
  );

  const pickupAdjacentSafe = useCallback(() => {
    if (!adjacentSafe) return;

    setTileMap((currentMap) =>
      currentMap.map((row, y) => row.map((tile, x) => (x === adjacentSafe.x && y === adjacentSafe.y ? 0 : tile))) as TileMap,
    );
    onPickupSafe(createSafeItem(adjacentSafe));
  }, [adjacentSafe, onPickupSafe]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      switch (event.key.toLowerCase()) {
        case "w":
        case "arrowup":
          event.preventDefault();
          moveBy({ x: 0, y: -1 });
          break;
        case "a":
        case "arrowleft":
          event.preventDefault();
          moveBy({ x: -1, y: 0 });
          break;
        case "s":
        case "arrowdown":
          event.preventDefault();
          moveBy({ x: 0, y: 1 });
          break;
        case "d":
        case "arrowright":
          event.preventDefault();
          moveBy({ x: 1, y: 0 });
          break;
        case "e":
          event.preventDefault();
          pickupAdjacentSafe();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, moveBy, pickupAdjacentSafe]);

  return { tileMap, charPos, adjacentSafe };
}
