import { gameState } from "./player.js";

export function initUI() {
  updateStatus();
}

export function logMessage(msg) {
  const log = document.getElementById("log-window");
  const p = document.createElement("div");
  p.textContent = msg;
  p.className = "text-sm mb-1";
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

export function updateStatus(state) {
  if (!state) return;

  // Update main status display
  const hpEl = document.getElementById("player-hp");
  const levelEl = document.getElementById("player-level");
  const expEl = document.getElementById("player-exp");

  if (hpEl) hpEl.textContent = `${state.hp}/${state.maxHp}`;
  if (levelEl) levelEl.textContent = state.level || 1;
  if (expEl) expEl.textContent = `${state.exp || 0}/${state.expToNext || 100}`;

  // Update sidebar stats
  const attackEl = document.getElementById("player-attack");
  const defenseEl = document.getElementById("player-defense");
  const goldEl = document.getElementById("player-gold");

  if (attackEl) attackEl.textContent = state.attack || 10;
  if (defenseEl) defenseEl.textContent = state.defense || 5;
  if (goldEl) goldEl.textContent = state.gold || 0;
}

export function updateNavigation(room) {
  if (!room) return;

  // Update room title
  const roomNameEl = document.getElementById("current-room-name");
  if (roomNameEl) {
    roomNameEl.textContent = room.name;
  }

  // Update room details
  const exitsEl = document.getElementById("available-exits");
  const itemsEl = document.getElementById("room-items");
  const npcsEl = document.getElementById("room-npcs");
  const monstersEl = document.getElementById("room-monsters");
  const modalExitsEl = document.getElementById("modal-exits");
  const modalItemsEl = document.getElementById("modal-items");
  const modalNpcsEl = document.getElementById("modal-npcs");
  const modalMonstersEl = document.getElementById("modal-monsters");

  if (exitsEl) {
    const exitList =
      Object.keys(room.exits).length > 0
        ? Object.keys(room.exits).join(", ")
        : "없음";
    exitsEl.textContent = exitList;
    if (modalExitsEl) {
      modalExitsEl.textContent = exitList;
    }
  }

  if (itemsEl) {
    const itemList =
      room.items.length > 0 ? room.items.map((i) => i.name).join(", ") : "없음";
    itemsEl.textContent = itemList;
    if (modalItemsEl) {
      modalItemsEl.textContent = itemList;
    }
  }

  if (npcsEl) {
    const npcList =
      room.npcs && room.npcs.length > 0 ? room.npcs.join(", ") : "없음";
    npcsEl.textContent = npcList;
    if (modalNpcsEl) {
      modalNpcsEl.textContent = npcList;
    }
  }

  if (monstersEl) {
    const monsterList =
      room.monsters && room.monsters.length > 0
        ? room.monsters.map((m) => m.name).join(", ")
        : "없음";
    monstersEl.textContent = monsterList;
    if (modalMonstersEl) {
      modalMonstersEl.textContent = monsterList;
    }
  }
}

export function updateCombatUI(room) {
  const attackBtn = document.getElementById("attack-button");
  const combatModal = document.getElementById("combat-modal");

  if (room && room.monsters && room.monsters.length > 0) {
    const monster = room.monsters[0];

    // Show combat modal
    if (combatModal) {
      combatModal.classList.remove("hidden");
      combatModal.classList.add("flex");
    }

    // Enable attack button
    if (attackBtn) {
      attackBtn.disabled = false;
      attackBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }

    // Update HP bars
    updateHPBar("player-hp-bar", gameState.hp, gameState.maxHp);
    updateHPBar("monster-hp-bar", monster.hp, monster.maxHp);

    // Update HP text
    const playerHpText = document.getElementById("player-hp-bar-text");
    const monsterHpText = document.getElementById("monster-hp-bar-text");

    if (playerHpText) {
      playerHpText.textContent = `${gameState.hp}/${gameState.maxHp}`;
    }

    if (monsterHpText) {
      monsterHpText.textContent = `${monster.hp}/${monster.maxHp}`;
    }
  } else {
    // Hide combat modal
    if (combatModal) {
      combatModal.classList.add("hidden");
      combatModal.classList.remove("flex");
    }

    // Disable attack button
    if (attackBtn) {
      attackBtn.disabled = true;
      attackBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
}

function updateHPBar(barId, currentHP, maxHP) {
  const bar = document.getElementById(barId);
  if (!bar) return;

  const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  bar.style.width = `${percentage}%`;

  // Add color coding based on HP percentage
  if (percentage > 60) {
    bar.classList.remove("bg-game-danger", "bg-game-warning");
    bar.classList.add("bg-game-success");
  } else if (percentage > 30) {
    bar.classList.remove("bg-game-success", "bg-game-danger");
    bar.classList.add("bg-game-warning");
  } else {
    bar.classList.remove("bg-game-success", "bg-game-warning");
    bar.classList.add("bg-game-danger");
  }
}

export function updateMapDisplay(grid) {
  const mapGrid = document.getElementById("map-grid");
  if (!mapGrid) return;

  let mapText = "";
  let rows = [];

  if (Array.isArray(grid)) {
    rows = grid;
    mapText = grid.join("\n");
  } else if (typeof grid === "string") {
    mapText = grid;
    rows = grid.split("\n");
  } else {
    mapText = "지도를 불러올 수 없습니다.";
  }

  mapGrid.textContent = mapText;

  const miniMapGrid = document.getElementById("mini-map-grid");
  const miniMapHint = document.getElementById("mini-map-hint");

  if (!miniMapGrid) return;

  miniMapGrid.innerHTML = "";

  const validRows = rows.filter(
    (row) => typeof row === "string" && row.trim().length > 0,
  );
  const columnCount = validRows.reduce(
    (max, row) => Math.max(max, row.length),
    0,
  );

  if (columnCount === 0) {
    miniMapGrid.style.gridTemplateColumns = "repeat(1, minmax(0, 1fr))";
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "text-xs text-gray-500";
    emptyMessage.textContent = "탐험을 시작하면 미니맵이 채워집니다.";
    miniMapGrid.appendChild(emptyMessage);
    if (miniMapHint) {
      miniMapHint.textContent = "새로운 지역을 방문해 보세요.";
    }
    return;
  }

  miniMapGrid.style.gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;

  validRows.forEach((row) => {
    const paddedRow = row.padEnd(columnCount, " ");
    [...paddedRow].forEach((cell) => {
      const cellElement = document.createElement("div");
      cellElement.className = "aspect-square rounded-sm";

      if (cell === "P") {
        cellElement.classList.add("bg-game-accent", "ring-2", "ring-white/70");
      } else if (cell === "o") {
        cellElement.classList.add("bg-white/40");
      } else {
        cellElement.classList.add("bg-white/10");
      }

      miniMapGrid.appendChild(cellElement);
    });
  });

  if (miniMapHint) {
    miniMapHint.textContent = "하이라이트된 칸이 현재 위치입니다.";
  }
}

export function toggleMap() {
  const mapDiv = document.getElementById("map-display");
  if (!mapDiv) return;

  const isVisible = !mapDiv.classList.contains("hidden");
  if (isVisible) {
    mapDiv.classList.add("hidden");
    mapDiv.classList.remove("flex");
  } else {
    mapDiv.classList.remove("hidden");
    mapDiv.classList.add("flex");
  }
}

// Additional UI utility functions
export function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add notification styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-primary);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

export function updatePlayerStats() {
  const stats = {
    hp: gameState.hp || 100,
    maxHp: gameState.maxHp || 100,
    level: gameState.level || 1,
    exp: gameState.exp || 0,
    expToNext: gameState.expToNext || 100,
    attack: gameState.attack || 10,
    defense: gameState.defense || 5,
    gold: gameState.gold || 0,
  };

  // Update all stat elements
  Object.keys(stats).forEach((stat) => {
    const element = document.getElementById(`player-${stat}`);
    if (element) {
      if (stat === "hp") {
        element.textContent = `${stats.hp}/${stats.maxHp}`;
      } else if (stat === "exp") {
        element.textContent = `${stats.exp}/${stats.expToNext}`;
      } else {
        element.textContent = stats[stat];
      }
    }
  });
}

export function animateElement(elementId, animation = "pulse") {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.style.animation = `${animation} 0.5s ease-in-out`;
  setTimeout(() => {
    element.style.animation = "";
  }, 500);
}

// Add CSS for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification-info {
        border-left: 4px solid var(--accent-primary);
    }
    
    .notification-success {
        border-left: 4px solid var(--accent-success);
    }
    
    .notification-warning {
        border-left: 4px solid var(--accent-warning);
    }
    
    .notification-error {
        border-left: 4px solid var(--accent-danger);
    }
`;
document.head.appendChild(style);
