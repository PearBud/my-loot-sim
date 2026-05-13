export type LootQuality = "red" | "gold" | "purple" | "blue";

export type LootItemDef = {
  id: string;
  name: string;
  /** 横向占据列数 */
  width: number;
  /** 纵向占据行数 */
  height: number;
  imageFile: string;
  searchSeconds: number;
  quality: LootQuality;
};

export type PlacedLoot = {
  instanceId: string;
  def: LootItemDef;
  originRow: number;
  originCol: number;
  revealed: boolean;
  searching: boolean;
};
