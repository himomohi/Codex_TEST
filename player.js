export const gameState = {
    name: '영웅',
    level: 1,
    exp: 0,
    nextLevelExp: 10,
    hp: 30,
    maxHp: 30,
    mp: 10,
    maxMp: 10,
    gold: 0,
    position: 'start',
    inventory: []
};

export function initGame() {
    // 초기화 가능
}

export function gainExp(amount) {
    gameState.exp += amount;
    checkLevelUp();
}

export function addGold(amount) {
    gameState.gold += amount;
}

export function checkLevelUp() {
    while (gameState.exp >= gameState.nextLevelExp) {
        gameState.exp -= gameState.nextLevelExp;
        gameState.level += 1;
        gameState.nextLevelExp = Math.floor(gameState.nextLevelExp * 1.5);
        gameState.maxHp += 5;
        gameState.maxMp += 2;
        gameState.hp = gameState.maxHp;
        gameState.mp = gameState.maxMp;
    }
}

export function useItem(itemName) {
    const idx = gameState.inventory.findIndex(i => i.name === itemName);
    if (idx === -1) return false;
    const [item] = gameState.inventory.splice(idx, 1);
    if (item.effect === 'heal') {
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + item.amount);
    } else if (item.effect === 'mana') {
        gameState.mp = Math.min(gameState.maxMp, gameState.mp + item.amount);
    }
    return true;
}
