import { gameState } from './player.js';
import { logMessage } from './uiManager.js';
import { getCurrentRoom } from './mapManager.js';

export function attack() {
    const room = getCurrentRoom();
    if (!room.monsters.length) {
        logMessage('공격할 대상이 없습니다.');
        return;
    }
    const monster = room.monsters[0];
    monster.hp -= 5;
    logMessage(`당신은 ${monster.name}을 공격했습니다. 남은 HP: ${monster.hp}`);
    if (monster.hp <= 0) {
        logMessage(`${monster.name}을 처치했습니다!`);
        room.monsters.shift();
    }
}
