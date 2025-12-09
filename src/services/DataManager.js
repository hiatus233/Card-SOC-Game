import cardData from '../data/cards.json';
import enemyData from '../data/enemies.json';
import locationData from '../data/locations.json';
import moduleData from '../data/modules.json';

export const DataManager = {
  // 获取所有卡牌
  getAllCards: () => cardData,
  
  // 根据 ID 获取单个卡牌
  getCardById: (id) => cardData.find(c => c.id === id),
  
  // 获取初始卡组
  getInitialDeck: () => {
    const initialIds = ['shoot', 'shoot', 'slash', 'slash', 'defend', 'defend', 'reload'];
    return initialIds.map((id, index) => {
      const card = cardData.find(c => c.id === id);
      // 如果数据文件里没找到卡牌，给一个默认的防止崩溃
      if (!card) return { id: 'error', name: 'Error', uid: `init_${index}` };
      return { ...card, uid: `init_${index}` };
    });
  },

  // 获取所有敌人模板
  getEnemyTemplates: () => enemyData,
  
  // 获取单个敌人模板
  getEnemyById: (id) => enemyData[id],

  // 获取所有地点类型
  getLocationTypes: () => locationData,
  getLocationTypeList: () => Object.values(locationData),

  // 获取所有模块
  getAllModules: () => moduleData,
};