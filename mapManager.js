import { gameState } from './player.js';
import { logMessage } from './uiManager.js';

const rooms = {
    start: {
        name: '시작의 방',
        description: '당신은 작고 어두운 방에 있습니다.',
        exits: { 북: 'field' },
        items: [{ name: '작은 체력포션', id: 'small_potion' }],
        npcs: [],
        monsters: []
    },
    field: {
        name: '초원',
        description: '넓은 초원이 펼쳐져 있습니다.',
        exits: { 남: 'start' },
        items: [{ name: '마나 포션', id: 'mana_potion' }],
        npcs: [],
        monsters: [{ name: '고블린', hp: 10 }]
    }
};

export function getCurrentRoom() {
    return rooms[gameState.position];
}

export function movePlayer(dir) {
    const room = getCurrentRoom();
    const dest = room.exits[dir];
    if (!dest) {
        logMessage('그 방향으로는 갈 수 없습니다.');
        return;
    }
    gameState.position = dest;
    logMessage(`${rooms[dest].name}으로 이동했습니다.`);
}

export function pickupItem(itemName) {
    const room = getCurrentRoom();
    const idx = room.items.findIndex(i => i.name === itemName);
    if (idx === -1) {
        logMessage('그런 아이템이 없습니다.');
        return;
    }
    const [item] = room.items.splice(idx, 1);
    gameState.inventory.push(item);
    logMessage(`${item.name}을 획득했습니다.`);
}
