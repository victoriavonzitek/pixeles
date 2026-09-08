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
  saveState();
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
    saveState();
    updatePointsUI();
    alert(`🎁 ¡Canje exitoso! Presenta tu ticket en el mostrador para reclamar: ${name}.`);
  } else {
    alert(`Puntos insuficientes. Requieres ${cost} pts y tienes ${state.points} pts.`);
  }
}
