import type { LootItemDef, LootQuality } from "./types";

export const GRID_SIZE = 4;
export const CELL_PX = 100;

/** 品质权重（总和 100） */
export const QUALITY_WEIGHTS: ReadonlyArray<{ quality: LootQuality; weight: number }> = [
  { quality: "red", weight: 5 },
  { quality: "gold", weight: 25 },
  { quality: "purple", weight: 30 },
  { quality: "blue", weight: 40 },
];

/** 物品库：按品质分组 */
export const LOOT_CONFIG: Record<LootQuality, readonly LootItemDef[]> = {
  red: [
    { id: "heart_of_africa", name: "非洲之心", width: 1, height: 1, imageFile: "heart_of_africa.png", searchSeconds: 7, quality: "red" },
    { id: "musket", name: "滑膛枪", width: 4, height: 1, imageFile: "滑膛枪.png", searchSeconds: 7, quality: "red" },
    { id: "vase", name: "花瓶", width: 2, height: 4, imageFile: "花瓶.png", searchSeconds: 7, quality: "red" },
    { id: "chessboard", name: "纵横", width: 3, height: 3, imageFile: "纵横.png", searchSeconds: 7, quality: "red" },
    { id: "painting", name: "印象派名画", width: 3, height: 3, imageFile: "印象派名画.png", searchSeconds: 7, quality: "red" },
    { id: "tank_model", name: "坦克模型", width: 3, height: 3, imageFile: "tank_model.png", searchSeconds: 7, quality: "red" },
    { id: "gramophone", name: "留声机", width: 2, height: 3, imageFile: "留声机.png", searchSeconds: 7, quality: "red" },
    { id: "bust", name: "半身像", width: 2, height: 3, imageFile: "半身像.png", searchSeconds: 7, quality: "red" },
    { id: "ifv_model", name: "步战车模型", width: 3, height: 2, imageFile: "ifv_model.png", searchSeconds: 7, quality: "red" },
    { id: "gazelle", name: "黄金瞪羚", width: 2, height: 2, imageFile: "黄金瞪羚.png", searchSeconds: 7, quality: "red" },
    { id: "crocodile", name: "黄金鳄鱼头", width: 2, height: 2, imageFile: "黄金鳄鱼头.png", searchSeconds: 7, quality: "red" },
    { id: "fossil", name: "化石", width: 2, height: 1, imageFile: "化石.png", searchSeconds: 7, quality: "red" },
    { id: "mechanical_watch", name: "机械表", width: 1, height: 1, imageFile: "机械表.png", searchSeconds: 7, quality: "red" },
    { id: "watch", name: "赛义德的怀表", width: 1, height: 1, imageFile: "watch.png", searchSeconds: 7, quality: "red" },
    { id: "gold_bar", name: "金条", width: 1, height: 2, imageFile: "gold_bar.png", searchSeconds: 7, quality: "red" },
  ],
  gold: [
    { id: "local_jewelry", name: "本地特色首饰", width: 3, height: 2, imageFile: "本地特色首饰.png", searchSeconds: 5, quality: "gold" },
    { id: "tiara", name: "珠宝头冠", width: 3, height: 1, imageFile: "珠宝头冠.png", searchSeconds: 5, quality: "gold" },
    { id: "laurel", name: "桂冠", width: 2, height: 1, imageFile: "桂冠.png", searchSeconds: 5, quality: "gold" },
    { id: "figurine", name: "荷美尔陶俑", width: 1, height: 2, imageFile: "荷美尔陶俑.png", searchSeconds: 5, quality: "gold" },
    { id: "asara_cup", name: "阿萨拉特色酒杯", width: 1, height: 1, imageFile: "阿萨拉特色酒杯.png", searchSeconds: 5, quality: "gold" },
    { id: "gold_lighter", name: "纯金打火机", width: 1, height: 1, imageFile: "纯金打火机.png", searchSeconds: 5, quality: "gold" },
    { id: "medal", name: "勋章", width: 1, height: 1, imageFile: "勋章.png", searchSeconds: 5, quality: "gold" },
    { id: "music_box", name: "八音盒", width: 1, height: 1, imageFile: "八音盒.png", searchSeconds: 5, quality: "gold" },
    { id: "clock", name: "座钟", width: 2, height: 2, imageFile: "clock.png", searchSeconds: 5, quality: "gold" },
    { id: "gold_coin", name: "海盗金币", width: 1, height: 1, imageFile: "gold_coin.png", searchSeconds: 5, quality: "gold" },
  ],
  purple: [
    { id: "mosaic_lamp", name: "马赛克台灯", width: 2, height: 3, imageFile: "马赛克台灯.png", searchSeconds: 3, quality: "purple" },
    { id: "dagger", name: "仪典匕首", width: 3, height: 2, imageFile: "dagger.png", searchSeconds: 3, quality: "purple" },
    { id: "golden_badge", name: "黄金饰章", width: 1, height: 2, imageFile: "黄金饰章.png", searchSeconds: 3, quality: "purple" },
    { id: "asara_lantern", name: "阿萨拉特色提灯", width: 1, height: 2, imageFile: "阿萨拉特色提灯.png", searchSeconds: 3, quality: "purple" },
    { id: "asara_pot", name: "阿萨拉特色酒壶", width: 1, height: 2, imageFile: "阿萨拉特色酒壶.png", searchSeconds: 3, quality: "purple" },
    { id: "horn", name: "牛角", width: 2, height: 1, imageFile: "horn.png", searchSeconds: 3, quality: "purple" },
    { id: "bird_carving", name: "鸟雕", width: 1, height: 1, imageFile: "鸟雕.png", searchSeconds: 3, quality: "purple" },
    { id: "totem_arrow", name: "图腾箭矢", width: 1, height: 1, imageFile: "图腾箭矢.png", searchSeconds: 3, quality: "purple" },
    { id: "coffee_cup", name: "典藏咖啡杯", width: 1, height: 1, imageFile: "典藏咖啡杯.png", searchSeconds: 3, quality: "purple" },
    { id: "earrings", name: "后妃耳环", width: 1, height: 1, imageFile: "earrings.png", searchSeconds: 3, quality: "purple" },
    { id: "scimitar", name: "海盗弯刀", width: 1, height: 1, imageFile: "scimitar.png", searchSeconds: 3, quality: "purple" },
  ],
  blue: [
    { id: "dancer_statue", name: "起舞的女郎", width: 1, height: 2, imageFile: "dancer_statue.png", searchSeconds: 2, quality: "blue" },
    { id: "telescope", name: "海盗望远镜", width: 1, height: 2, imageFile: "海盗望远镜.png", searchSeconds: 2, quality: "blue" },
    { id: "silver_coin", name: "海盗银币", width: 1, height: 1, imageFile: "silver_coin.png", searchSeconds: 2, quality: "blue" },
    { id: "wristband", name: "腕带", width: 1, height: 1, imageFile: "腕带.png", searchSeconds: 2, quality: "blue" },
  ],
};

export const ALL_LOOT_ITEMS: readonly LootItemDef[] = [
  ...LOOT_CONFIG.red,
  ...LOOT_CONFIG.gold,
  ...LOOT_CONFIG.purple,
  ...LOOT_CONFIG.blue,
];

export function craftedItemUrl(imageFile: string) {
  return encodeURI(`/items/Crafted Collection/${imageFile}`);
}
