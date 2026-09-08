// LÓGICA DE CAFETERÍA
const cart = [];

function addToOrder(name, price) {
  cart.push({ name, price });
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Tu carrito está vacío</p>';
    document.getElementById('cart-subtotal').innerText = '0';
    document.getElementById('cart-total').innerText = '0';
    return;
  }

  let subtotal = 0;
  cart.forEach((item, index) => {
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
  cart.splice(index, 1);
  updateCartUI();
}

function checkoutOrder() {
  if (cart.length === 0) {
    alert("Agrega productos al carrito antes de confirmar.");
    return;
  }

  const usePoints = document.getElementById('use-points').checked;
  if (usePoints && state.points >= 100) {
    state.points -= 100;
    saveState();
    updatePointsUI();
  }

  alert("☕ ¡Pedido enviado a barra! En breve estará listo tu pedido.");
  cart.length = 0;
  document.getElementById('use-points').checked = false;
  updateCartUI();
}
