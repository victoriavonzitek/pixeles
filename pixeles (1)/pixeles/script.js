// ESTADO GLOBAL DE LA APLICACIÓN
const state = {
  cardConnected: false,
  cardId: null,
  points: 0,
  cart: []
};

// NAVEGACIÓN ENTRE SECCIONES (TABS)
function switchTab(tabId, event) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-menu .tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(`sec-${tabId}`).classList.add('active');
  if (event) event.currentTarget.classList.add('active');
}

// SISTEMA DE TARJETA & PUNTOS
function loadCard() {
  const cardInput = document.getElementById('card-id');
  const val = cardInput.value.trim();

  if (val.length >= 4) {
    state.cardConnected = true;
    state.cardId = val;
    state.points = 250; // Saldo inicial simulado de bienvenida
    updatePointsUI();
    alert(`🎮 ¡Tarjeta ${state.cardId} conectada exitosamente! Saldo inicial: 250 Puntos.`);
  } else {
    alert("Por favor, ingrese un ID de tarjeta válido (mínimo 4 caracteres).");
  }
}

function updatePointsUI() {
  document.getElementById('user-points').innerText = state.points;
}

// LÓGICA DE CAFETERÍA
function addToOrder(name, price) {
  state.cart.push({ name, price });
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (state.cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Tu carrito está vacío</p>';
    document.getElementById('cart-subtotal').innerText = '0';
    document.getElementById('cart-total').innerText = '0';
    return;
  }

  let subtotal = 0;
  state.cart.forEach((item, index) => {
    subtotal += item.price;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.name}</span>
      <span>$${item.price} <a href="#" onclick="removeItem(${index})" style="color:var(--neon-magenta); margin-left:5px;">✕</a></span>
    `;
    container.appendChild(div);
  });

  const usePointsCheckbox = document.getElementById('use-points');
  let total = subtotal;

  if (usePointsCheckbox.checked) {
    if (!state.cardConnected || state.points < 100) {
      alert("Necesitas conectar una tarjeta con al menos 100 puntos para aplicar el descuento.");
      usePointsCheckbox.checked = false;
    } else {
      total = subtotal * 0.8; // 20% OFF
    }
  }

  document.getElementById('cart-subtotal').innerText = subtotal;
  document.getElementById('cart-total').innerText = Math.round(total);
}

function removeItem(index) {
  state.cart.splice(index, 1);
  updateCartUI();
}

function checkoutOrder() {
  if (state.cart.length === 0) {
    alert("Agrega productos al carrito antes de confirmar.");
    return;
  }

  const usePoints = document.getElementById('use-points').checked;
  if (usePoints && state.points >= 100) {
    state.points -= 100;
    updatePointsUI();
  }

  alert("☕ ¡Pedido enviado a barra! En breve estará listo tu pedido.");
  state.cart = [];
  document.getElementById('use-points').checked = false;
  updateCartUI();
}

// LÓGICA DE MANGA
function filterManga() {
  const query = document.getElementById('manga-search').value.toLowerCase();
  const cards = document.querySelectorAll('.manga-card');

  cards.forEach(card => {
    const title = card.getAttribute('data-title').toLowerCase();
    card.style.display = title.includes(query) ? 'flex' : 'none';
  });
}

function readInRoom(title) {
  alert(`📖 '${title}' registrado para lectura gratuita en sala. Recuerda devolverlo al terminar y mantener tus manos limpias.`);
}

function rentManga(title, price) {
  if (!state.cardConnected) {
    if (confirm(`¿Deseas alquilar '${title}' por $${price} en efectivo/tarjeta? (Conecta tu Tarjeta Pixeles para usar puntos)`)) {
      alert(`Alquiler confirmado para '${title}'. Retíralo en el mostrador.`);
    }
    return;
  }

  const usePoints = confirm(`¿Deseas pagar el alquiler de '${title}' usando 150 Puntos de tu tarjeta en lugar de dinero?`);
  if (usePoints) {
    if (state.points >= 150) {
      state.points -= 150;
      updatePointsUI();
      alert(`🎉 ¡Alquiler abonado con Puntos! Disfruta de '${title}'.`);
    } else {
      alert("Puntos insuficientes. Saldo necesario: 150 pts.");
    }
  } else {
    alert(`Alquiler registrado por $${price}. Retíralo en el mostrador.`);
  }
}

// LÓGICA DE ARCADE
function buyTokens(amount, price) {
  alert(`🕹️ Has comprado un pack de ${amount} fichas por $${price}. ¡A jugar!`);
}

function playArcadeGame() {
  if (!state.cardConnected) {
    alert("Conecta tu Tarjeta Pixeles arriba para acumular puntos por cada partida.");
    return;
  }

  state.points += 50;
  updatePointsUI();
  alert("🎮 ¡Partida completada! Sumaste +50 Puntos a tu tarjeta.");
}

function redeemReward(name, cost) {
  if (!state.cardConnected) {
    alert("Debes conectar tu Tarjeta Pixeles para poder canjear tus puntos.");
    return;
  }

  if (state.points >= cost) {
    state.points -= cost;
    updatePointsUI();
    alert(`🎁 ¡Canje exitoso! Presenta tu ticket en el mostrador para reclamar: ${name}.`);
  } else {
    alert(`Puntos insuficientes. Requieres ${cost} pts y tienes ${state.points} pts.`);
  }
}