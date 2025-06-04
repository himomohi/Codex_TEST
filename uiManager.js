export function initUI() {
    updateStatus();
}

export function logMessage(msg) {
    const log = document.getElementById('log-window');
    const p = document.createElement('div');
    p.textContent = msg;
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
    status.textContent = `${state.name} Lv${state.level} HP:${state.hp}/${state.maxHp} MP:${state.mp}/${state.maxMp} 골드:${state.gold} | 인벤토리: ${inv}`;
}

export function updateNavigation(room) {
    if (!room) return;
    document.getElementById('current-room-name').textContent = `[${room.name}]`;
    document.getElementById('available-exits').textContent = `이동: ${Object.keys(room.exits).join(', ')}`;
    document.getElementById('room-items').textContent = `아이템: ${room.items.map(i => i.name).join(', ')}`;
    document.getElementById('room-npcs').textContent = `NPC: ${room.npcs.join(', ')}`;
    document.getElementById('room-monsters').textContent = `몬스터: ${room.monsters.map(m => m.name).join(', ')}`;
}
