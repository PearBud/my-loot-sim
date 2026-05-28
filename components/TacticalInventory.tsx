"use client";

import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { craftedItemUrl } from "@/lib/loot-sim/config";

export type InventoryItemType = "safe" | "loot";
export type InventoryItemRarity = "blue" | "purple" | "gold" | "red";

export type TacticalInventoryItem = {
  id: string;
  name: string;
  type: InventoryItemType;
  rarity: InventoryItemRarity;
  icon: string;
  description: string;
  width?: number;
  height?: number;
  imageFile?: string;
};

type TacticalInventoryProps = {
  items?: TacticalInventoryItem[];
  onClose: () => void;
  onOpenSafe: (safeId: string) => void;
  onDiscardItem: (itemId: string) => void;
};

type ContextMenuState = { item: TacticalInventoryItem; x: number; y: number };
type PlacedInventoryItem = { item: TacticalInventoryItem; row: number; col: number; width: number; height: number };

const GRID_COLS = 6;
const GRID_ROWS = 6;
const GRID_SIZE = GRID_COLS * GRID_ROWS;

const MOCK_INVENTORY: TacticalInventoryItem[] = [
  { id: "safe-classified-001", name: "机密保险箱", type: "safe", rarity: "red", icon: "▣", description: "加密军规箱庭，内部可能封存最高价值资产。", width: 1, height: 1 },
  { id: "loot-art-001", name: "名贵艺术品", type: "loot", rarity: "gold", icon: "◆", description: "保存完好的稀有艺术藏品，黑市估值极高。", width: 2, height: 2 },
  { id: "safe-supply-001", name: "普通物资箱", type: "safe", rarity: "blue", icon: "□", description: "基础补给容器，通常包含低风险物资。", width: 1, height: 1 },
];

const RARITY_STYLES: Record<InventoryItemRarity, string> = {
  blue: "border-blue-400/50 bg-blue-950/18 text-blue-200 shadow-[0_0_18px_rgba(96,165,250,0.16)]",
  purple: "border-purple-400/55 bg-purple-950/20 text-purple-200 shadow-[0_0_20px_rgba(192,132,252,0.2)]",
  gold: "border-amber-300/65 bg-amber-950/20 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.24)]",
  red: "border-red-400/70 bg-red-950/24 text-red-100 shadow-[0_0_26px_rgba(248,113,113,0.28)]",
};
const RARITY_LABELS: Record<InventoryItemRarity, string> = { blue: "BLUE", purple: "PURPLE", gold: "GOLD", red: "RED" };
const RARITY_ORDER: Record<InventoryItemRarity, number> = { red: 0, gold: 1, purple: 2, blue: 3 };

function itemSize(item: TacticalInventoryItem) {
  return {
    width: item.type === "safe" ? 1 : Math.max(1, Math.min(GRID_COLS, item.width ?? 1)),
    height: item.type === "safe" ? 1 : Math.max(1, Math.min(GRID_ROWS, item.height ?? 1)),
  };
}

function sortInventoryItems(items: TacticalInventoryItem[]) {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "safe" ? -1 : 1;
    const rarityDiff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    const aArea = itemSize(a).width * itemSize(a).height;
    const bArea = itemSize(b).width * itemSize(b).height;
    return bArea - aArea || a.name.localeCompare(b.name, "zh-Hans-CN");
  });
}

function canPlace(occupied: boolean[][], width: number, height: number, row: number, col: number) {
  if (row + height > GRID_ROWS || col + width > GRID_COLS) return false;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) if (occupied[row + y][col + x]) return false;
  }
  return true;
}

function placeInventoryItems(items: TacticalInventoryItem[]) {
  const occupied = Array.from({ length: GRID_ROWS }, () => Array<boolean>(GRID_COLS).fill(false));
  const placed: PlacedInventoryItem[] = [];
  for (const item of sortInventoryItems(items)) {
    const { width, height } = itemSize(item);
    let found: { row: number; col: number } | null = null;
    for (let row = 0; row < GRID_ROWS && !found; row += 1) {
      for (let col = 0; col < GRID_COLS && !found; col += 1) if (canPlace(occupied, width, height, row, col)) found = { row, col };
    }
    if (!found) continue;
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) occupied[found.row + y][found.col + x] = true;
    placed.push({ item, row: found.row, col: found.col, width, height });
  }
  return { placed, occupiedCount: occupied.flat().filter(Boolean).length };
}

export function TacticalInventory({ items, onClose, onOpenSafe, onDiscardItem }: TacticalInventoryProps) {
  const [mockInventory, setMockInventory] = useState<TacticalInventoryItem[]>(MOCK_INVENTORY);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inventory = items ?? mockInventory;
  const { placed, occupiedCount } = useMemo(() => placeInventoryItems(inventory), [inventory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (contextMenu) setContextMenu(null);
      else onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contextMenu, onClose]);

  useEffect(() => {
    if (!contextMenu) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setContextMenu(null);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [contextMenu]);

  const openContextMenu = useCallback((event: MouseEvent<HTMLButtonElement>, item: TacticalInventoryItem) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ item, x: event.clientX, y: event.clientY });
  }, []);

  const discardItem = useCallback((itemId: string) => {
    if (!items) setMockInventory((currentInventory) => currentInventory.filter((item) => item.id !== itemId));
    setContextMenu(null);
    onDiscardItem(itemId);
  }, [items, onDiscardItem]);

  const openSafe = useCallback((safeId: string) => {
    setContextMenu(null);
    onOpenSafe(safeId);
  }, [onOpenSafe]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 text-zinc-100 backdrop-blur-xl">
      <section className="relative flex h-[min(86vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950/92 shadow-[0_0_120px_rgba(0,0,0,0.65)]" role="dialog" aria-modal="true" aria-labelledby="tactical-inventory-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-5 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.36em] text-emerald-300/75">Tactical Storage Terminal</p>
            <h2 id="tactical-inventory-title" className="mt-1 text-2xl font-semibold tracking-wide text-zinc-50">战术终端 / 背包管理 <span className="font-mono text-emerald-300">(INVENTORY)</span></h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-xs text-zinc-300 transition hover:border-red-400/60 hover:bg-red-950/30 hover:text-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300">关闭 (ESC)</button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 p-5 lg:grid-cols-[1fr_280px]">
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/45 p-4 shadow-[inset_0_0_36px_rgba(63,63,70,0.22)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.035)_1px,transparent_1px)] bg-[length:100%_24px,24px_100%] opacity-70" />
            <div className="relative grid aspect-square max-h-full grid-cols-6 grid-rows-6 gap-2" aria-label="战术背包储物格">
              {Array.from({ length: GRID_SIZE }, (_, index) => <div key={`empty-slot-${index}`} className="rounded-md border border-dashed border-zinc-800/85 bg-zinc-950/45 shadow-[inset_0_0_16px_rgba(0,0,0,0.45)]" />)}
              {placed.map(({ item, row, col, width, height }) => (
                <button key={item.id} type="button" onClick={(event) => openContextMenu(event, item)} onContextMenu={(event) => openContextMenu(event, item)} className={`group relative z-10 flex min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border-2 p-1.5 text-center transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 ${RARITY_STYLES[item.rarity]}`} style={{ gridColumn: `${col + 1} / span ${width}`, gridRow: `${row + 1} / span ${height}` }} aria-label={`选择物品 ${item.name}`}>
                  {item.imageFile ? <div className="relative h-full w-full min-h-0"><Image src={craftedItemUrl(item.imageFile)} alt={item.name} fill sizes="220px" unoptimized className="object-contain p-2 drop-shadow-[0_0_10px_currentColor]" /></div> : <span className="text-2xl leading-none drop-shadow-[0_0_10px_currentColor] md:text-3xl">{item.icon}</span>}
                  <span className="absolute inset-x-1 bottom-4 truncate rounded bg-black/55 px-1 text-[10px] font-medium text-zinc-100">{item.name}</span>
                  <span className="absolute bottom-1 font-mono text-[9px] opacity-70">{RARITY_LABELS[item.rarity]} · {width}×{height}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-500">Inventory Status</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <div className="flex justify-between border-b border-zinc-800 pb-2"><span>占用格</span><span className="font-mono text-zinc-200">{occupiedCount}/36</span></div>
              <div className="flex justify-between border-b border-zinc-800 pb-2"><span>保险箱</span><span className="font-mono text-emerald-300">{inventory.filter((item) => item.type === "safe").length}</span></div>
              <div className="flex justify-between border-b border-zinc-800 pb-2"><span>战利品</span><span className="font-mono text-amber-300">{inventory.filter((item) => item.type === "loot").length}</span></div>
            </div>
            <p className="mt-6 text-xs leading-5 text-zinc-600">保险箱固定占 1×1 并优先排列；战利品按品质从红到蓝排列，并占用自身尺寸。</p>
          </aside>
        </div>
      </section>

      {contextMenu ? <div ref={menuRef} className="fixed z-[110] w-44 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950/96 p-1 font-mono text-sm text-zinc-200 shadow-[0_18px_55px_rgba(0,0,0,0.75)] backdrop-blur-xl" style={{ left: contextMenu.x, top: contextMenu.y }} role="menu">
        <div className="border-b border-zinc-800 px-3 py-2"><p className="truncate text-xs text-zinc-300">{contextMenu.item.name}</p><p className="mt-0.5 text-[10px] uppercase text-zinc-600">{contextMenu.item.rarity} · {contextMenu.item.type}</p></div>
        {contextMenu.item.type === "safe" ? <button type="button" onClick={() => openSafe(contextMenu.item.id)} className="block w-full rounded px-3 py-2 text-left text-emerald-200 transition hover:bg-emerald-950/45" role="menuitem">打开箱庭</button> : <button type="button" onClick={() => setContextMenu(null)} className="block w-full rounded px-3 py-2 text-left text-cyan-200 transition hover:bg-cyan-950/45" role="menuitem">查看详情</button>}
        <button type="button" onClick={() => discardItem(contextMenu.item.id)} className="block w-full rounded px-3 py-2 text-left text-red-200 transition hover:bg-red-950/45" role="menuitem">丢弃物品</button>
        <button type="button" onClick={() => setContextMenu(null)} className="block w-full rounded px-3 py-2 text-left text-zinc-400 transition hover:bg-zinc-800" role="menuitem">取消</button>
      </div> : null}
    </div>
  );
}
