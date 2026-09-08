// ESTADO GLOBAL COMPARTIDO ENTRE PÁGINAS (persistido en localStorage)
const STORAGE_KEY = 'pixeles_state';

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // sigue con estado por defecto si el JSON guardado está corrupto
    }
  }
  return { cardConnected: false, cardId: null, points: 0 };
}

const state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    cardConnected: state.cardConnected,
    cardId: state.cardId,
    points: state.points
  }));
}

// WIDGET DE TARJETA (presente en el header de todas las páginas)
function loadCard() {
  const cardInput = document.getElementById('card-id');
  const val = cardInput.value.trim();

  if (val.length >= 4) {
    state.cardConnected = true;
    state.cardId = val;
    state.points = 250; // Saldo inicial simulado de bienvenida
    saveState();
    updatePointsUI();
    alert(`🎮 ¡Tarjeta ${state.cardId} conectada exitosamente! Saldo inicial: 250 Puntos.`);
  } else {
    alert("Por favor, ingrese un ID de tarjeta válido (mínimo 4 caracteres).");
  }
}

function disconnectCard() {
  state.cardConnected = false;
  state.cardId = null;
  state.points = 0;
  saveState();
  updatePointsUI();
  renderCardWidget();
}

function updatePointsUI() {
  const el = document.getElementById('user-points');
  if (el) el.innerText = state.points;
}

// Dibuja el widget según haya o no una tarjeta conectada
function renderCardWidget() {
  const widget = document.getElementById('card-widget-zone');
  if (!widget) return;

  if (state.cardConnected) {
    widget.innerHTML = `
      <div class="card-connected">
        <span class="card-id-tag">TARJETA ${state.cardId}</span>
        <button onclick="disconnectCard()" class="btn-link">DESCONECTAR</button>
      </div>
      <div class="points-badge">
        <span class="label">PUNTOS</span>
        <span id="user-points" class="value">${state.points}</span>
      </div>
    `;
  } else {
    widget.innerHTML = `
      <div class="card-input-group">
        <input type="text" id="card-id" placeholder="ID TARJETA" maxlength="8">
        <button onclick="loadCard()" class="btn-glow">CONECTAR</button>
      </div>
      <div class="points-badge">
        <span class="label">PUNTOS</span>
        <span id="user-points" class="value">0</span>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', renderCardWidget);
