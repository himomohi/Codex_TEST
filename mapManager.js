import { gameState } from './player.js';
import { logMessage } from './uiManager.js';

const rooms = {
    start: {
        name: '시작의 방',
        description: '당신은 작고 어두운 방에 있습니다.',
        exits: { 북: 'field' },
        coord: { x: 0, y: 0 },
        items: [{ name: '작은 체력포션', id: 'small_potion', effect: 'heal', amount: 10 }],
        npcs: [],
        monsters: []
    },
    field: {
        name: '초원',
        description: '넓은 초원이 펼쳐져 있습니다.',
        exits: { 남: 'start', 서: 'forest', 동: 'cave' },
        coord: { x: 0, y: 1 },
        items: [{ name: '마나 포션', id: 'mana_potion', effect: 'mana', amount: 5 }],
        npcs: [],
        monsters: [{ name: '고블린', hp: 10, exp: 5, gold: 2 }]
    },
    forest: {
        name: '숲',
        description: '울창한 숲입니다.',
        exits: { 동: 'field' },
        coord: { x: -1, y: 1 },
        items: [{ name: '큰 체력포션', id: 'big_potion', effect: 'heal', amount: 20 }],
        npcs: [],
        monsters: [{ name: '늑대', hp: 15, exp: 8, gold: 4 }]
    },
    cave: {
        name: '동굴',
        description: '어두운 동굴 안입니다.',
        exits: { 서: 'field' },
        coord: { x: 1, y: 1 },
        items: [],
        npcs: [],
        monsters: [{ name: '오크', hp: 20, exp: 12, gold: 6 }]
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

export function getRooms() {
    return rooms;
}

export function getMapGrid() {
    const coords = Object.values(rooms).map(r => r.coord);
    const minX = Math.min(...coords.map(c => c.x));
    const maxX = Math.max(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    const maxY = Math.max(...coords.map(c => c.y));

    const grid = [];
    for (let y = maxY; y >= minY; y--) {
        let row = '';
        for (let x = minX; x <= maxX; x++) {
            const roomKey = Object.keys(rooms).find(k => rooms[k].coord.x === x && rooms[k].coord.y === y);
            if (gameState.position && rooms[gameState.position].coord.x === x && rooms[gameState.position].coord.y === y) {
                row += 'P';
            } else if (roomKey) {
                row += 'o';
            } else {
                row += ' ';
            }
        }
        grid.push(row);
    }
    return grid;
}
