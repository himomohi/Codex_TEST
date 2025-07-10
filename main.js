import { initUI, logMessage, updateStatus, updateNavigation, updateCombatUI, updateMapDisplay } from './uiManager.js';
import { parseCommand } from './commandParser.js';
import { gameState, initGame } from './player.js';
import { getCurrentRoom, getMapGrid } from './mapManager.js';

// Global state for UI interactions
let isMapVisible = false;
let isCombatModalVisible = false;

function setupEventListeners() {
    // Movement buttons
    document.querySelectorAll('#move-buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.getAttribute('data-dir');
            logMessage(`> 이동 ${dir}`);
            parseCommand(`이동 ${dir}`);
            updateUI();
            addRecentAction(`이동: ${dir}`);
        });
    });

    // Action bar buttons
    document.getElementById('inspect-button').addEventListener('click', () => {
        logMessage('> 주변');
        parseCommand('주변');
        updateUI();
        addRecentAction('주변 탐색');
    });

    document.getElementById('toggle-map-button').addEventListener('click', () => {
        toggleMap();
    });

    const atkBtn = document.getElementById('attack-button');
    atkBtn.addEventListener('click', () => {
        logMessage('> 공격');
        parseCommand('공격');
        updateUI();
        addRecentAction('공격');
    });

    // Combat modal buttons
    const modalAtkBtn = document.getElementById('combat-attack-button');
    if (modalAtkBtn) {
        modalAtkBtn.addEventListener('click', () => {
            logMessage('> 공격');
            parseCommand('공격');
            updateUI();
            addRecentAction('전투 공격');
        });
    }

    const fleeBtn = document.getElementById('combat-flee-button');
    if (fleeBtn) {
        fleeBtn.addEventListener('click', () => {
            logMessage('> 도망');
            parseCommand('도망');
            updateUI();
            addRecentAction('도망');
            closeCombatModal();
        });
    }

    // Modal close buttons
    const closeCombatBtn = document.getElementById('close-combat');
    if (closeCombatBtn) {
        closeCombatBtn.addEventListener('click', () => {
            closeCombatModal();
        });
    }

    const closeMapBtn = document.getElementById('close-map');
    if (closeMapBtn) {
        closeMapBtn.addEventListener('click', () => {
            closeMap();
        });
    }

    // Clear log button
    const clearLogBtn = document.getElementById('clear-log');
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
            clearLog();
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                simulateButtonClick('북');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                simulateButtonClick('남');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                simulateButtonClick('서');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                simulateButtonClick('동');
                break;
            case ' ':
                e.preventDefault();
                if (document.getElementById('attack-button').disabled === false) {
                    simulateButtonClick('공격');
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (isMapVisible) closeMap();
                if (isCombatModalVisible) closeCombatModal();
                break;
        }
    });
}

function simulateButtonClick(action) {
    if (action === '공격') {
        const attackBtn = document.getElementById('attack-button');
        if (!attackBtn.disabled) {
            attackBtn.click();
        }
    } else {
        const moveBtn = document.querySelector(`[data-dir="${action}"]`);
        if (moveBtn) {
            moveBtn.click();
        }
    }
}

function toggleMap() {
    if (isMapVisible) {
        closeMap();
    } else {
        openMap();
    }
}

function openMap() {
    const mapDisplay = document.getElementById('map-display');
    mapDisplay.style.display = 'flex';
    isMapVisible = true;
    updateMapDisplay(getMapGrid());
    addRecentAction('지도 열기');
}

function closeMap() {
    const mapDisplay = document.getElementById('map-display');
    mapDisplay.style.display = 'none';
    isMapVisible = false;
}

function closeCombatModal() {
    const combatModal = document.getElementById('combat-modal');
    combatModal.style.display = 'none';
    isCombatModalVisible = false;
}

function clearLog() {
    const logWindow = document.getElementById('log-window');
    logWindow.innerHTML = '';
    addRecentAction('로그 지우기');
}

function addRecentAction(action) {
    const recentActions = document.getElementById('recent-actions');
    const actionItem = document.createElement('div');
    actionItem.className = 'action-item';
    actionItem.textContent = action;
    
    // Add timestamp
    const now = new Date();
    const time = now.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    actionItem.setAttribute('data-time', time);
    
    recentActions.insertBefore(actionItem, recentActions.firstChild);
    
    // Keep only last 10 actions
    while (recentActions.children.length > 10) {
        recentActions.removeChild(recentActions.lastChild);
    }
}

function bindDynamicButtons() {
    // Item buttons
    const itemContainer = document.querySelector('#item-buttons .button-container');
    itemContainer.innerHTML = '';
    const room = getCurrentRoom();
    
    if (room.items.length === 0) {
        const noItems = document.createElement('div');
        noItems.className = 'no-items';
        noItems.textContent = '아이템이 없습니다';
        noItems.style.color = 'var(--text-muted)';
        noItems.style.fontStyle = 'italic';
        noItems.style.padding = 'var(--spacing-sm)';
        itemContainer.appendChild(noItems);
    } else {
        room.items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-item';
            btn.innerHTML = `
                <span class="item-icon">📦</span>
                <span class="item-text">줍기 ${item.name}</span>
            `;
            btn.addEventListener('click', () => {
                logMessage(`> 줍기 ${item.name}`);
                parseCommand(`줍기 ${item.name}`);
                updateUI();
                addRecentAction(`줍기: ${item.name}`);
            });
            itemContainer.appendChild(btn);
        });
    }

    // Inventory buttons
    const invContainer = document.querySelector('#inventory-buttons .button-container');
    invContainer.innerHTML = '';
    
    if (gameState.inventory.length === 0) {
        const noItems = document.createElement('div');
        noItems.className = 'no-items';
        noItems.textContent = '인벤토리가 비어있습니다';
        noItems.style.color = 'var(--text-muted)';
        noItems.style.fontStyle = 'italic';
        noItems.style.padding = 'var(--spacing-sm)';
        invContainer.appendChild(noItems);
    } else {
        gameState.inventory.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-inventory';
            btn.innerHTML = `
                <span class="item-icon">🎒</span>
                <span class="item-text">사용 ${item.name}</span>
            `;
            btn.addEventListener('click', () => {
                logMessage(`> 사용 ${item.name}`);
                parseCommand(`사용 ${item.name}`);
                updateUI();
                addRecentAction(`사용: ${item.name}`);
            });
            invContainer.appendChild(btn);
        });
    }
}

function updateUI() {
    updateStatus(gameState);
    const room = getCurrentRoom();
    updateNavigation(room);
    updateCombatUI(room);
    updateMapDisplay(getMapGrid());
    bindDynamicButtons();
    
    // Update sidebar stats
    updateSidebarStats();
}

function updateSidebarStats() {
    // Update player stats in sidebar
    const attackEl = document.getElementById('player-attack');
    const defenseEl = document.getElementById('player-defense');
    const goldEl = document.getElementById('player-gold');
    
    if (attackEl) attackEl.textContent = gameState.attack || 10;
    if (defenseEl) defenseEl.textContent = gameState.defense || 5;
    if (goldEl) goldEl.textContent = gameState.gold || 0;
    
    // Update main status display
    const hpEl = document.getElementById('player-hp');
    const levelEl = document.getElementById('player-level');
    const expEl = document.getElementById('player-exp');
    
    if (hpEl) hpEl.textContent = `${gameState.hp}/${gameState.maxHp}`;
    if (levelEl) levelEl.textContent = gameState.level || 1;
    if (expEl) expEl.textContent = `${gameState.exp || 0}/${gameState.expToNext || 100}`;
}

function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Initialize game
window.addEventListener('load', () => {
    showLoading();
    
    // Simulate loading time for better UX
    setTimeout(() => {
        initGame();
        initUI();
        setupEventListeners();
        updateUI();
        logMessage('🎮 환상의 세계 MUD에 오신 것을 환영합니다!');
        logMessage('💡 이동하려면 방향 버튼을 클릭하거나 WASD 키를 사용하세요.');
        logMessage('⚔️ 전투가 시작되면 공격 버튼이 활성화됩니다.');
        logMessage('🗺️ 지도 버튼으로 월드 맵을 확인할 수 있습니다.');
        hideLoading();
    }, 1000);
});
