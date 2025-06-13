import { initUI, logMessage, updateStatus, updateNavigation, updateCombatUI, updateMapDisplay } from './uiManager.js';
import { parseCommand } from './commandParser.js';
import { gameState, initGame } from './player.js';
import { getCurrentRoom, getMapGrid } from './mapManager.js';

function setupEventListeners() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-button');
    sendBtn.addEventListener('click', () => handleInput(input.value));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleInput(input.value);
        }
    });
    const quickBtn = document.getElementById('quick-attack-button');
    quickBtn.addEventListener('click', () => {
        logMessage('> 공격');
        parseCommand('공격');
        updateUI();
    });
}

function handleInput(text) {
    const input = document.getElementById('chat-input');
    if (!text.trim()) return;
    logMessage(`> ${text}`);
    parseCommand(text.trim());
    input.value = '';
    input.focus();
    updateUI();
}

function updateUI() {
    updateStatus(gameState);
    const room = getCurrentRoom();
    updateNavigation(room);
    updateCombatUI(room);
    updateMapDisplay(getMapGrid());
}

window.addEventListener('load', () => {
    initGame();
    initUI();
    setupEventListeners();
    updateUI();
    const input = document.getElementById('chat-input');
    input.focus();
    logMessage('게임을 시작합니다. 명령을 입력하세요.');
});
