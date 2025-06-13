import { initUI, logMessage, updateStatus, updateNavigation, updateCombatUI, updateMapDisplay } from './uiManager.js';
import { parseCommand } from './commandParser.js';
import { gameState, initGame } from './player.js';
import { getCurrentRoom, getMapGrid } from './mapManager.js';

function setupEventListeners() {
    document.querySelectorAll('#move-buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.getAttribute('data-dir');
            logMessage(`> 이동 ${dir}`);
            parseCommand(`이동 ${dir}`);
            updateUI();
        });
    });
    document.getElementById('inspect-button').addEventListener('click', () => {
        logMessage('> 주변');
        parseCommand('주변');
        updateUI();
    });
    document.getElementById('toggle-map-button').addEventListener('click', () => {
        logMessage('> 지도');
        parseCommand('지도');
        updateUI();
    });
    const atkBtn = document.getElementById('attack-button');
    atkBtn.addEventListener('click', () => {
        logMessage('> 공격');
        parseCommand('공격');
        updateUI();
    });
}

function bindDynamicButtons() {
    const itemContainer = document.getElementById('item-buttons');
    itemContainer.innerHTML = '';
    const room = getCurrentRoom();
    room.items.forEach(item => {
        const b = document.createElement('button');
        b.textContent = `줍기 ${item.name}`;
        b.addEventListener('click', () => {
            logMessage(`> 줍기 ${item.name}`);
            parseCommand(`줍기 ${item.name}`);
            updateUI();
        });
        itemContainer.appendChild(b);
    });

    const invContainer = document.getElementById('inventory-buttons');
    invContainer.innerHTML = '';
    gameState.inventory.forEach(item => {
        const b = document.createElement('button');
        b.textContent = `사용 ${item.name}`;
        b.addEventListener('click', () => {
            logMessage(`> 사용 ${item.name}`);
            parseCommand(`사용 ${item.name}`);
            updateUI();
        });
        invContainer.appendChild(b);
    });
}

function updateUI() {
    updateStatus(gameState);
    const room = getCurrentRoom();
    updateNavigation(room);
    updateCombatUI(room);
    updateMapDisplay(getMapGrid());
    bindDynamicButtons();
}

window.addEventListener('load', () => {
    initGame();
    initUI();
    setupEventListeners();
    updateUI();
    logMessage('게임을 시작합니다. 버튼을 사용해 플레이하세요.');
});
