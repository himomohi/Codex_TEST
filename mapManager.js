import { gameState } from './player.js';
import { logMessage } from './uiManager.js';

const rooms = {
    start: {
        name: '시작의 방',
        description: '당신은 작고 어두운 방에 있습니다.',
        exits: { 북: 'field' },
        items: [],
        npcs: [],
        monsters: []
    },
    field: {
        name: '초원',
        description: '넓은 초원이 펼쳐져 있습니다.',
        exits: { 남: 'start' },
        items: [],
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
