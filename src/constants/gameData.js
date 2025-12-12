export const GAME_STATE = {
  MENU: 'MENU',
  MAP_SELECT: 'MAP_SELECT',
  EXPLORING: 'EXPLORING',
  COMBAT: 'COMBAT',
  LOOTING: 'LOOTING',
  CAMP: 'CAMP',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

export const CARD_TYPES = {
  ATTACK: 'ATTACK',
  SKILL: 'SKILL',
  POWER: 'POWER'
};

export const STATUS_TYPES = {
  RADIATION: 'RADIATION',
  LOCK_ON: 'LOCK_ON',
  STUN: 'STUN'
};

export const ENEMY_INTENTS = {
  ATTACK: 'ATTACK',
  DEFEND: 'DEFEND',
  BUFF: 'BUFF',
  DEBUFF: 'DEBUFF',
  CHARGE: 'CHARGE',
  ESCAPE: 'ESCAPE',
  SLEEP: 'SLEEP'
};

// UI配置：稀有度颜色
export const RARITY_CONFIG = {
  COMMON: { color: 'text-zinc-400', border: 'border-zinc-600', bg: 'bg-zinc-900', label: '普通' },
  RARE: { color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-950', label: '稀有' },
  EPIC: { color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-950', label: '史诗' },
  LEGENDARY: { color: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-950', label: '传说' },
};

// 战利品表 (简单起见放在这里，以后也可以移到 JSON)
export const LOOT_TABLE = [
  { id: 'scrap', name: '废弃金属', rarity: 'COMMON', value: 15, desc: '普通的回收材料。', effect: null },
  { id: 'battery', name: '微型电池', rarity: 'COMMON', value: 20, desc: '通用的能源载体。', effect: null },
  { id: 'medkit_s', name: '简易急救包', rarity: 'RARE', value: 30, desc: '撤离时：回复 10 点生命。', effect: { type: 'HEAL', val: 10 } },
  { id: 'stim_pack', name: '战斗兴奋剂', rarity: 'RARE', value: 35, desc: '撤离时：回复 2 点能量上限(仅下场战斗)。', effect: { type: 'BUFF_ENERGY', val: 1 } },
  { id: 'cpu_core', name: 'AI 核心', rarity: 'EPIC', value: 80, desc: '高价值算力核心。', effect: null },
  { id: 'gold_bar', name: '旧世界金条', rarity: 'EPIC', value: 100, desc: '硬通货。', effect: null },
  { id: 'fusion_cell', name: '聚变电池', rarity: 'LEGENDARY', value: 200, desc: '撤离时：最大生命值 +5。', effect: { type: 'MAX_HP', val: 5 } },
];