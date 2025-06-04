import { logMessage } from './uiManager.js';
import { movePlayer, getCurrentRoom, pickupItem } from './mapManager.js';
import { gameState } from './player.js';
import { attack } from './combatSystem.js';

export function parseCommand(text) {
    const [cmd, ...args] = text.split(' ');
    switch (cmd) {
        case '이동':
        case 'move':
            if (args.length === 0) {
                logMessage('어디로 이동합니까?');
                return;
            }
            movePlayer(args[0]);
            break;
        case '공격':
            attack();
            break;
        case '줍기':
        case 'get':
            if (args.length === 0) {
                logMessage('어떤 아이템을 줍습니까?');
                return;
            }
            pickupItem(args[0]);
            break;
        case '주변':
        case '살피기':
            describeRoom();
            break;
        case '도움말':
            logMessage('명령어: 이동 [방향], 공격, 주변, 줍기 [아이템]');
            break;
        default:
            logMessage('알 수 없는 명령어입니다.');
    }
}

function describeRoom() {
    const room = getCurrentRoom();
    if (!room) return;
    logMessage(room.description);
}
