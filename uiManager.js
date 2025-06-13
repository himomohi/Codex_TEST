import { gameState } from './player.js';

export function initUI() {
    updateStatus();
}

export function logMessage(msg) {
    const log = document.getElementById('log-window');
    const p = document.createElement('div');
    p.textContent = msg;
    p.className = 'log-entry';
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

export function updateStatus(state) {
    const status = document.getElementById('status-display');
    if (!state) {
        status.textContent = '';
        return;
    }
    const inv = state.inventory.map(i => i.name).join(', ') || '없음';
    status.textContent = `${state.name} Lv${state.level} EXP:${state.exp}/${state.nextLevelExp} HP:${state.hp}/${state.maxHp} MP:${state.mp}/${state.maxMp} 골드:${state.gold} | 인벤토리: ${inv}`;
}

export function updateNavigation(room) {
    if (!room) return;
    document.getElementById('current-room-name').textContent = `[${room.name}]`;
    document.getElementById('available-exits').textContent = `이동: ${Object.keys(room.exits).join(', ')}`;
    document.getElementById('room-items').textContent = `아이템: ${room.items.map(i => i.name).join(', ')}`;
    document.getElementById('room-npcs').textContent = `NPC: ${room.npcs.join(', ')}`;
    document.getElementById('room-monsters').textContent = `몬스터: ${room.monsters.map(m => m.name).join(', ')}`;
}

export function updateCombatUI(room) {
    const attackBtn = document.getElementById('attack-button');
    const combatUI = document.getElementById('combat-ui');
    if (room && room.monsters.length) {
        const monster = room.monsters[0];
        combatUI.style.display = 'block';
        attackBtn.disabled = false;
        attackBtn.classList.add('show');
        document.getElementById('player-hp-bar').textContent = `플레이어 HP: ${gameState.hp}/${gameState.maxHp}`;
        document.getElementById('monster-hp-bar').textContent = `${monster.name} HP: ${monster.hp}`;
    } else {
        combatUI.style.display = 'none';
        attackBtn.disabled = true;
        attackBtn.classList.remove('show');
    }
}

export function updateMapDisplay(grid) {
    const mapGrid = document.getElementById('map-grid');
    if (!grid) return;
    mapGrid.textContent = grid.join('\n');
}

export function toggleMap() {
    const mapDiv = document.getElementById('map-display');
    mapDiv.style.display = mapDiv.style.display === 'block' ? 'none' : 'block';
}
