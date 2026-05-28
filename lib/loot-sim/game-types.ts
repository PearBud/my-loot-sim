import type { LootItemDef, LootQuality } from "@/lib/loot-sim/types";

export type GameMode = "EXPLORING" | "INVENTORY" | "DECRYPTING";

export type GameItemType = "Safe" | "Loot";

export type Position = {
  x: number;
  y: number;
};

export type SafeConfig = {
  level: LootQuality;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: GameItemType;
  config: SafeConfig | LootItemDef;
};
