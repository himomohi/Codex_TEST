import {
  initUI,
  logMessage,
  updateStatus,
  updateNavigation,
  updateCombatUI,
  updateMapDisplay,
} from "./uiManager.js";
import { parseCommand } from "./commandParser.js";
import { gameState, initGame } from "./player.js";
import { getCurrentRoom, getMapGrid } from "./mapManager.js";

// UI 상태 유틸리티
function isElementVisible(element) {
  return element ? !element.classList.contains("hidden") : false;
}

function showElement(element) {
  if (!element) return;
  element.classList.remove("hidden");
  element.classList.add("flex");
}

function hideElement(element) {
  if (!element) return;
  element.classList.add("hidden");
  element.classList.remove("flex");
}

function closeIfVisible(elementId, closeFn) {
  const element = document.getElementById(elementId);
  if (isElementVisible(element)) {
    closeFn();
  }
}

function setupEventListeners() {
  // Movement buttons
  document.querySelectorAll(".btn-direction").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.getAttribute("data-dir");
      logMessage(`> 이동 ${dir}`);
      parseCommand(`이동 ${dir}`);
      updateUI();
      addRecentAction(`이동: ${dir}`);
    });
  });

  // Action buttons
  document.getElementById("inspect-button").addEventListener("click", () => {
    logMessage("> 주변");
    parseCommand("주변");
    updateUI();
    addRecentAction("주변 탐색");
  });

  document.getElementById("toggle-map-button").addEventListener("click", () => {
    toggleMap();
  });

  document.getElementById("attack-button").addEventListener("click", () => {
    logMessage("> 공격");
    parseCommand("공격");
    updateUI();
    addRecentAction("공격");
  });

  const interactionBtn = document.getElementById("interaction-button");
  if (interactionBtn) {
    interactionBtn.addEventListener("click", () => {
      toggleInteraction();
    });
  }

  document.getElementById("inventory-button").addEventListener("click", () => {
    toggleInventory();
  });

  document.getElementById("settings-button").addEventListener("click", () => {
    toggleSettings();
  });

  document.getElementById("help-button").addEventListener("click", () => {
    toggleHelp();
  });

  // Combat modal buttons
  const modalAtkBtn = document.getElementById("combat-attack-button");
  if (modalAtkBtn) {
    modalAtkBtn.addEventListener("click", () => {
      logMessage("> 공격");
      parseCommand("공격");
      updateUI();
      addRecentAction("전투 공격");
    });
  }

  const fleeBtn = document.getElementById("combat-flee-button");
  if (fleeBtn) {
    fleeBtn.addEventListener("click", () => {
      logMessage("> 도망");
      parseCommand("도망");
      updateUI();
      addRecentAction("도망");
      closeCombatModal();
    });
  }

  // Modal close buttons
  const closeCombatBtn = document.getElementById("close-combat");
  if (closeCombatBtn) {
    closeCombatBtn.addEventListener("click", () => {
      closeCombatModal();
    });
  }

  const closeMapBtn = document.getElementById("close-map");
  if (closeMapBtn) {
    closeMapBtn.addEventListener("click", () => {
      closeMap();
    });
  }

  const closeInventoryBtn = document.getElementById("close-inventory");
  if (closeInventoryBtn) {
    closeInventoryBtn.addEventListener("click", () => {
      closeInventory();
    });
  }

  const closeInteractionBtn = document.getElementById("close-interaction");
  if (closeInteractionBtn) {
    closeInteractionBtn.addEventListener("click", () => {
      closeInteraction();
    });
  }

  const closeSettingsBtn = document.getElementById("close-settings");
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", () => {
      closeSettings();
    });
  }

  const closeHelpBtn = document.getElementById("close-help");
  if (closeHelpBtn) {
    closeHelpBtn.addEventListener("click", () => {
      closeHelp();
    });
  }

  // Clear log button
  const clearLogBtn = document.getElementById("clear-log");
  if (clearLogBtn) {
    clearLogBtn.addEventListener("click", () => {
      clearLog();
    });
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        e.preventDefault();
        simulateButtonClick("북");
        break;
      case "ArrowDown":
      case "s":
      case "S":
        e.preventDefault();
        simulateButtonClick("남");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        e.preventDefault();
        simulateButtonClick("서");
        break;
      case "ArrowRight":
      case "d":
      case "D":
        e.preventDefault();
        simulateButtonClick("동");
        break;
      case " ":
        e.preventDefault();
        if (document.getElementById("attack-button").disabled === false) {
          simulateButtonClick("공격");
        }
        break;
      case "m":
      case "M":
        e.preventDefault();
        toggleMap();
        break;
      case "i":
      case "I":
        e.preventDefault();
        toggleInventory();
        break;
      case "e":
      case "E":
        e.preventDefault();
        toggleInteraction();
        break;
      case "Escape":
        e.preventDefault();
        closeIfVisible("map-display", closeMap);
        closeIfVisible("combat-modal", closeCombatModal);
        closeIfVisible("inventory-modal", closeInventory);
        closeIfVisible("interaction-modal", closeInteraction);
        closeIfVisible("settings-modal", closeSettings);
        closeIfVisible("help-modal", closeHelp);
        break;
    }
  });
}

function simulateButtonClick(action) {
  if (action === "공격") {
    const attackBtn = document.getElementById("attack-button");
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
  const mapDisplay = document.getElementById("map-display");
  if (!mapDisplay) return;

  if (isElementVisible(mapDisplay)) {
    closeMap();
  } else {
    openMap();
  }
}

function openMap() {
  const mapDisplay = document.getElementById("map-display");
  showElement(mapDisplay);
  updateMapDisplay(getMapGrid());
  addRecentAction("지도 열기");
}

function closeMap() {
  const mapDisplay = document.getElementById("map-display");
  hideElement(mapDisplay);
}

function toggleInventory() {
  const inventoryModal = document.getElementById("inventory-modal");
  if (isElementVisible(inventoryModal)) {
    closeInventory();
  } else {
    openInventory();
  }
}

function openInventory() {
  const inventoryModal = document.getElementById("inventory-modal");
  showElement(inventoryModal);
  updateInventoryDisplay();
  addRecentAction("인벤토리 열기");
}

function closeInventory() {
  const inventoryModal = document.getElementById("inventory-modal");
  hideElement(inventoryModal);
}

function toggleInteraction() {
  const interactionModal = document.getElementById("interaction-modal");
  if (isElementVisible(interactionModal)) {
    closeInteraction();
  } else {
    openInteraction();
  }
}

function openInteraction() {
  const interactionModal = document.getElementById("interaction-modal");
  if (!interactionModal) return;
  showElement(interactionModal);
  bindDynamicButtons();
  addRecentAction("상호작용 열기");
}

function closeInteraction() {
  const interactionModal = document.getElementById("interaction-modal");
  if (!interactionModal) return;
  hideElement(interactionModal);
}

function toggleSettings() {
  const settingsModal = document.getElementById("settings-modal");
  if (isElementVisible(settingsModal)) {
    closeSettings();
  } else {
    openSettings();
  }
}

function openSettings() {
  const settingsModal = document.getElementById("settings-modal");
  showElement(settingsModal);
  addRecentAction("설정 열기");
}

function closeSettings() {
  const settingsModal = document.getElementById("settings-modal");
  hideElement(settingsModal);
}

function toggleHelp() {
  const helpModal = document.getElementById("help-modal");
  if (isElementVisible(helpModal)) {
    closeHelp();
  } else {
    openHelp();
  }
}

function openHelp() {
  const helpModal = document.getElementById("help-modal");
  showElement(helpModal);
  addRecentAction("도움말 열기");
}

function closeHelp() {
  const helpModal = document.getElementById("help-modal");
  hideElement(helpModal);
}

function closeCombatModal() {
  const combatModal = document.getElementById("combat-modal");
  hideElement(combatModal);
}

function clearLog() {
  const logWindow = document.getElementById("log-window");
  logWindow.innerHTML =
    '<div class="text-gray-400">로그가 지워졌습니다...</div>';
  addRecentAction("로그 지우기");
}

function updateInventoryDisplay() {
  renderInventoryButtons();
}

function addRecentAction(action) {
  // This function can be used to track recent actions if needed
  console.log(`Action: ${action}`);
}

function bindDynamicButtons() {
  renderRoomItemButtons();
  renderInventoryButtons();
}

function renderRoomItemButtons() {
  const itemContainer = document.getElementById("item-buttons");
  if (!itemContainer) return;

  itemContainer.innerHTML = "";
  const room = getCurrentRoom();

  if (!room || !room.items || room.items.length === 0) {
    const noItems = document.createElement("div");
    noItems.className = "text-gray-400 text-sm";
    noItems.textContent = "아이템이 없습니다";
    itemContainer.appendChild(noItems);
    return;
  }

  room.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.className =
      "w-full bg-gray-700/80 hover:bg-gray-600 rounded-lg p-2 text-sm transition-colors text-left flex items-center gap-2";
    btn.innerHTML = `
            <span>📦</span>
            <span>줍기 ${item.name}</span>
        `;
    btn.addEventListener("click", () => {
      logMessage(`> 줍기 ${item.name}`);
      parseCommand(`줍기 ${item.name}`);
      updateUI();
      addRecentAction(`줍기: ${item.name}`);
    });
    itemContainer.appendChild(btn);
  });
}

function renderInventoryButtons() {
  const invContainer = document.getElementById("inventory-buttons");
  if (!invContainer) return;

  invContainer.innerHTML = "";

  if (!gameState.inventory || gameState.inventory.length === 0) {
    const noItems = document.createElement("div");
    noItems.className = "text-gray-400 text-sm text-center py-4";
    noItems.textContent = "인벤토리가 비어있습니다";
    invContainer.appendChild(noItems);
    return;
  }

  gameState.inventory.forEach((item) => {
    const btn = document.createElement("button");
    btn.className =
      "w-full bg-gray-700/80 hover:bg-gray-600 rounded-lg p-2 text-sm transition-colors text-left flex items-center gap-2";
    btn.innerHTML = `
            <span>🎒</span>
            <span>사용 ${item.name}</span>
        `;
    btn.addEventListener("click", () => {
      logMessage(`> 사용 ${item.name}`);
      parseCommand(`사용 ${item.name}`);
      updateUI();
      addRecentAction(`사용: ${item.name}`);
    });
    invContainer.appendChild(btn);
  });
}

function updateUI() {
  updateStatus(gameState);
  const room = getCurrentRoom();
  updateNavigation(room);
  updateCombatUI(room);
  updateMapDisplay(getMapGrid());
  bindDynamicButtons();

  // Update all stats
  updateAllStats();
}

function updateAllStats() {
  // Update player stats
  const attackEl = document.getElementById("player-attack");
  const defenseEl = document.getElementById("player-defense");
  const goldEl = document.getElementById("player-gold");
  const hpEl = document.getElementById("player-hp");
  const levelEl = document.getElementById("player-level");
  const expEl = document.getElementById("player-exp");

  if (attackEl) attackEl.textContent = gameState.attack || 10;
  if (defenseEl) defenseEl.textContent = gameState.defense || 5;
  if (goldEl) goldEl.textContent = gameState.gold || 0;
  if (hpEl)
    hpEl.textContent = `${gameState.hp || 100}/${gameState.maxHp || 100}`;
  if (levelEl) levelEl.textContent = gameState.level || 1;
  if (expEl)
    expEl.textContent = `${gameState.exp || 0}/${gameState.expToNext || 100}`;

  const hpBarMain = document.getElementById("player-hp-bar-main");
  const expBar = document.getElementById("player-exp-bar");

  if (hpBarMain) {
    const maxHp = gameState.maxHp || 100;
    const currentHp = Math.max(0, Math.min(maxHp, gameState.hp || 0));
    const hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
    const clampedPercent = Math.max(0, Math.min(100, hpPercent));

    hpBarMain.style.width = `${clampedPercent}%`;
    hpBarMain.classList.remove(
      "bg-game-success",
      "bg-game-warning",
      "bg-game-danger",
    );

    if (clampedPercent > 60) {
      hpBarMain.classList.add("bg-game-success");
    } else if (clampedPercent > 30) {
      hpBarMain.classList.add("bg-game-warning");
    } else {
      hpBarMain.classList.add("bg-game-danger");
    }
  }

  if (expBar) {
    const expToNext = gameState.expToNext || 100;
    const currentExp = Math.max(0, Math.min(expToNext, gameState.exp || 0));
    const expPercent = expToNext > 0 ? (currentExp / expToNext) * 100 : 0;
    const clampedExpPercent = Math.max(0, Math.min(100, expPercent));
    expBar.style.width = `${clampedExpPercent}%`;
  }
}

function showLoading() {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("flex");
  }
}

function hideLoading() {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
    loadingOverlay.classList.remove("flex");
  }
}

// Initialize game
window.addEventListener("load", () => {
  showLoading();

  // Simulate loading time for better UX
  setTimeout(() => {
    initGame();
    initUI();
    setupEventListeners();
    updateUI();
    logMessage("🎮 환상의 세계 MUD에 오신 것을 환영합니다!");
    logMessage("💡 이동하려면 방향 버튼을 클릭하거나 WASD 키를 사용하세요.");
    logMessage("⚔️ 전투가 시작되면 공격 버튼이 활성화됩니다.");
    logMessage("🗺️ 지도 버튼으로 월드 맵을 확인할 수 있습니다.");
    hideLoading();
  }, 1000);
});
