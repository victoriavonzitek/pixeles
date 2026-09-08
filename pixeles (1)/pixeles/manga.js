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
      saveState();
      updatePointsUI();
      alert(`🎉 ¡Alquiler abonado con Puntos! Disfruta de '${title}'.`);
    } else {
      alert("Puntos insuficientes. Saldo necesario: 150 pts.");
    }
  } else {
    alert(`Alquiler registrado por $${price}. Retíralo en el mostrador.`);
  }
}
