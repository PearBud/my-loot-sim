import { ALL_LOOT_ITEMS, GRID_SIZE, LOOT_CONFIG, QUALITY_WEIGHTS } from "./config";
import type { LootItemDef, LootQuality, PlacedLoot } from "./types";

type BoolGrid = boolean[][];

function emptyOccupancy(): BoolGrid {
  return Array.from({ length: GRID_SIZE }, () => Array<boolean>(GRID_SIZE).fill(false));
}

function area(def: LootItemDef) {
  return def.width * def.height;
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickQuality(): LootQuality {
  const r = Math.random() * 100;
  let acc = 0;
  for (const { quality, weight } of QUALITY_WEIGHTS) {
    acc += weight;
    if (r < acc) return quality;
  }
  return "blue";
}

function canPlace(occ: BoolGrid, def: LootItemDef, originRow: number, originCol: number) {
  if (originRow < 0 || originCol < 0) return false;
  if (originRow + def.height > GRID_SIZE || originCol + def.width > GRID_SIZE) return false;
  for (let r = 0; r < def.height; r++) {
    for (let c = 0; c < def.width; c++) {
      if (occ[originRow + r]![originCol + c]) return false;
    }
  }
  return true;
}

function allValidOrigins(occ: BoolGrid, def: LootItemDef): Array<{ row: number; col: number }> {
  const out: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlace(occ, def, r, c)) out.push({ row: r, col: c });
    }
  }
  return out;
}

function markOccupied(occ: BoolGrid, def: LootItemDef, originRow: number, originCol: number) {
  for (let r = 0; r < def.height; r++) {
    for (let c = 0; c < def.width; c++) {
      occ[originRow + r]![originCol + c] = true;
    }
  }
}

function newInstanceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `loot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * 单次生成：先按权重抽品质 → 随机物品尝试落位；
 * 若放不下，则在该品质内按面积从小到大尝试；仍失败则全局按面积从小到大兜底。
 */
function trySpawnOne(occ: BoolGrid): PlacedLoot | null {
  const quality = pickQuality();
  const pool = LOOT_CONFIG[quality];
  const first = pool[Math.floor(Math.random() * pool.length)]!;
  const tryPlace = (def: LootItemDef): PlacedLoot | null => {
    const origins = allValidOrigins(occ, def);
    if (origins.length === 0) return null;
    const pick = origins[Math.floor(Math.random() * origins.length)]!;
    markOccupied(occ, def, pick.row, pick.col);
    return {
      instanceId: newInstanceId(),
      def,
      originRow: pick.row,
      originCol: pick.col,
      revealed: false,
      searching: false,
    };
  };

  const firstTry = tryPlace(first);
  if (firstTry) return firstTry;

  const byAreaInQuality = [...pool].sort((a, b) => area(a) - area(b) || Math.random() - 0.5);
  for (const def of byAreaInQuality) {
    const p = tryPlace(def);
    if (p) return p;
  }

  const globalSorted = [...ALL_LOOT_ITEMS].sort((a, b) => area(a) - area(b) || Math.random() - 0.5);
  for (const def of globalSorted) {
    const p = tryPlace(def);
    if (p) return p;
  }

  return null;
}

/** 开局：清空网格，尝试生成 2–3 个互不重叠的物品 */
export function generateLootBoard(): PlacedLoot[] {
  const occ = emptyOccupancy();
  const target = randomInt(2, 3);
  const result: PlacedLoot[] = [];

  for (let i = 0; i < target; i++) {
    const one = trySpawnOne(occ);
    if (!one) break;
    result.push(one);
  }

  return result;
}
