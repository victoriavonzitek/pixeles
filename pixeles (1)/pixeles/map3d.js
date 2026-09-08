// MAPA 3D INTERACTIVO COMPLETO Y REDISEÑADO — three.js

function initMap3D(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  if (typeof THREE === 'undefined') {
    mount.innerHTML = '<p class="map3d-fallback">No se pudo cargar three.js (revisá tu conexión a internet).</p>';
    return;
  }

  // --- PALETA Y CONSTANTES ---
  const PALETTE = {
    ink: 0x201b16,
    paper: 0xfbf8f0,
    arcade: 0xd99b23,
    manga: 0xc97b92,
    cafe: 0x0e7c7b,
    counter: 0x3a2e2b,
    wood: 0x8b5a2b,
    screen: 0x44aaff,
    player: 0xff4757,
    npc: 0x2ed573,
    posterManga: 0xe84393,
    posterArcade: 0x00cec9,
    posterCafe: 0xfab1a0
  };

  // Mapa ampliado (24 x 24)
  const ROOM = { w: 24, d: 24 };
  const ARCADE_X = 7.0;
  const MANGA_X = 15.0;
  const MANGA_Z = 14.0;

  const colliders = [];

  // --- ESCENA Y RENDERER ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.paper);

  const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  mount.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';

  const labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  mount.appendChild(labelRenderer.domElement);

  // --- ILUMINACIÓN ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(12, 22, 12);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // --- AUXILIARES ---
  function addOutline(mesh, color = PALETTE.ink) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: color }));
    mesh.add(line);
  }

  function registerCollider(mesh) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push(box);
  }

  function makeLabel(text, x, y, z) {
    const div = document.createElement('div');
    div.className = 'map3d-label';
    div.textContent = text;
    const obj = new THREE.CSS2DObject(div);
    obj.position.set(x, y, z);
    scene.add(obj);
    return div;
  }

  // --- DECORACIÓN EN PAREDES (PÓSTERS / CUADROS) ---
  function addWallPoster(x, y, z, width, height, color, rotY = 0) {
    const group = new THREE.Group();

    const frameGeo = new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.04);
    const frameMat = new THREE.MeshLambertMaterial({ color: PALETTE.ink });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    group.add(frame);

    const artGeo = new THREE.BoxGeometry(width, height, 0.05);
    const artMat = new THREE.MeshLambertMaterial({ color: color });
    const art = new THREE.Mesh(artGeo, artMat);
    group.add(art);

    const innerGeo = new THREE.BoxGeometry(width * 0.6, height * 0.4, 0.06);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.set(0, 0.1, 0);
    group.add(inner);

    group.position.set(x, y, z);
    group.rotation.y = rotY;
    scene.add(group);
  }

  // --- PISO ---
  function addFloor(x0, z0, x1, z1, color) {
    const w = x1 - x0, d = z1 - z0;
    const geo = new THREE.BoxGeometry(w, 0.2, d);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x0 + w / 2, -0.1, z0 + d / 2);
    mesh.receiveShadow = true;
    addOutline(mesh);
    scene.add(mesh);
  }

  addFloor(0, 0, ARCADE_X, ROOM.d, PALETTE.arcade);
  addFloor(MANGA_X, 0, ROOM.w, MANGA_Z, PALETTE.manga);
  addFloor(ARCADE_X, 0, MANGA_X, MANGA_Z, PALETTE.cafe);
  addFloor(ARCADE_X, MANGA_Z, ROOM.w, ROOM.d, PALETTE.cafe);

  // --- PAREDES Y PUERTAS ---
  function addWall(x0, z0, x1, z1, height = 2.2, color = PALETTE.ink) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const geo = new THREE.BoxGeometry(len, height, 0.2);
    const mat = new THREE.MeshLambertMaterial({ color });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set((x0 + x1) / 2, height / 2, (z0 + z1) / 2);
    wall.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    addOutline(wall, PALETTE.paper);
    scene.add(wall);
    registerCollider(wall);
  }

  // Perímetro exterior
  addWall(0, 0, ROOM.w, 0);
  addWall(0, ROOM.d, ROOM.w, ROOM.d);
  addWall(0, 0, 0, ROOM.d);
  addWall(ROOM.w, 0, ROOM.w, ROOM.d);

  // Divisoria Arcade (Con puerta de paso)
  addWall(ARCADE_X, 0, ARCADE_X, 9.0, 1.8, PALETTE.arcade);
  addWall(ARCADE_X, 12.5, ARCADE_X, ROOM.d, 1.8, PALETTE.arcade);

  // Divisoria Biblioteca Manga (Con puerta de paso)
  addWall(MANGA_X, 0, MANGA_X, 8.0, 1.8, PALETTE.manga);
  addWall(MANGA_X, 11.5, MANGA_X, MANGA_Z, 1.8, PALETTE.manga);
  addWall(MANGA_X, MANGA_Z, ROOM.w, MANGA_Z, 1.8, PALETTE.manga);

  // Pósters en Paredes
  addWallPoster(0.12, 1.4, 5.0, 1.2, 1.6, PALETTE.posterArcade, Math.PI / 2);
  addWallPoster(0.12, 1.4, 11.0, 1.2, 1.6, 0xff7675, Math.PI / 2);
  addWallPoster(0.12, 1.4, 17.0, 1.2, 1.6, 0x74b9ff, Math.PI / 2);

  addWallPoster(17.5, 1.4, 0.12, 1.2, 1.6, PALETTE.posterManga, 0);
  addWallPoster(21.0, 1.4, 0.12, 1.2, 1.6, 0xa29bfe, 0);
  addWallPoster(23.88, 1.4, 6.0, 1.4, 1.8, PALETTE.posterManga, -Math.PI / 2);

  addWallPoster(9.0, 1.4, 0.12, 1.4, 1.2, PALETTE.posterCafe, 0);
  addWallPoster(13.0, 1.4, 0.12, 1.4, 1.2, 0x55efc4, 0);

  // --- MUEBLES Y SECCIONES ---

  // 1. BIBLIOTECA MANGA
  function createBookshelf(x, z, w, d) {
    const geo = new THREE.BoxGeometry(w, 2.0, d);
    const mat = new THREE.MeshLambertMaterial({ color: PALETTE.wood });
    const shelf = new THREE.Mesh(geo, mat);
    shelf.position.set(x, 1.0, z);
    addOutline(shelf);
    scene.add(shelf);
    registerCollider(shelf);
  }

  createBookshelf(17.5, 3.5, 0.8, 5.0);
  createBookshelf(20.5, 3.5, 0.8, 5.0);
  createBookshelf(17.5, 10.0, 0.8, 5.0);
  createBookshelf(20.5, 10.0, 0.8, 5.0);

  // Mostrador de retiro de manga (esquina superior derecha)
  const mangaCounter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.9, 1.2), new THREE.MeshLambertMaterial({ color: PALETTE.counter }));
  mangaCounter.position.set(22.0, 0.45, 1.5);
  addOutline(mangaCounter, PALETTE.paper);
  scene.add(mangaCounter);
  registerCollider(mangaCounter);
  makeLabel('RETIRO MANGA', 22.0, 1.3, 1.5);

  // 2. CAFETERÍA (Reorganizada para llenar el pasillo central)
  const TABLE_GRID = [
    [9.5, 3.5], [12.5, 3.5],
    [9.5, 7.5], [12.5, 7.5],
    [9.5, 11.5], [12.5, 11.5],
    [9.5, 15.5], [13.0, 15.5], [16.5, 15.5],
    [9.5, 19.5], [13.0, 19.5]
  ];

  TABLE_GRID.forEach(([x, z]) => {
    const tableGroup = new THREE.Group();
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16), new THREE.MeshLambertMaterial({ color: PALETTE.wood }));
    top.position.y = 0.8;
    tableGroup.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8), new THREE.MeshLambertMaterial({ color: PALETTE.ink }));
    leg.position.y = 0.4;
    tableGroup.add(leg);

    tableGroup.position.set(x, 0, z);
    scene.add(tableGroup);

    const colMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4));
    colMesh.position.set(x, 0.45, z);
    colMesh.visible = false;
    scene.add(colMesh);
    registerCollider(colMesh);
  });

  // Mostrador Principal de la Cafetería
  const cafeCounter = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.0, 1.4), new THREE.MeshLambertMaterial({ color: PALETTE.counter }));
  cafeCounter.position.set(20.5, 0.5, 22.0);
  addOutline(cafeCounter, PALETTE.paper);
  scene.add(cafeCounter);
  registerCollider(cafeCounter);
  makeLabel('CAJA / CAFÉ', 20.5, 1.5, 22.0);

  // 3. ARCADE (Lleno de máquinas con colisión física)
  function createArcadeCabinet(x, z, rotY = 0) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.9, 0.9), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    body.position.y = 0.95;
    group.add(body);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.1), new THREE.MeshBasicMaterial({ color: PALETTE.screen }));
    screen.position.set(0, 1.35, 0.41);
    screen.rotation.x = -0.2;
    group.add(screen);

    group.position.set(x, 0, z);
    group.rotation.y = rotY;
    scene.add(group);

    const colMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 1.0));
    colMesh.position.set(x, 0.95, z);
    colMesh.visible = false;
    scene.add(colMesh);
    registerCollider(colMesh);
  }

  // Fila Pared
  for (let z = 2.0; z <= 22.0; z += 2.4) {
    createArcadeCabinet(1.0, z, Math.PI / 2);
  }

  // Islas Centrales enfrentadas
  for (let z = 4.0; z <= 20.0; z += 4.0) {
    createArcadeCabinet(4.0, z, -Math.PI / 2);
    createArcadeCabinet(5.0, z, Math.PI / 2);
  }

  // --- PERSONAJES ---
  function createPersonMesh(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 10), new THREE.MeshLambertMaterial({ color }));
    body.position.y = 0.6;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), new THREE.MeshLambertMaterial({ color: 0xffdbac }));
    head.position.y = 1.2;
    group.add(head);
    return group;
  }

  const npcPositions = [
    [2.3, 4.0], [2.3, 16.0], [4.0, 12.0],
    [19.0, 3.5], [17.5, 12.0], [22.0, 3.0],
    [9.5, 4.5], [12.5, 11.5], [20.5, 20.2]
  ];

  npcPositions.forEach(([x, z]) => {
    const npc = createPersonMesh(PALETTE.npc);
    npc.position.set(x, 0, z);
    scene.add(npc);
    registerCollider(npc);
  });

  // JUGADOR
  const playerGroup = createPersonMesh(PALETTE.player);
  playerGroup.position.set(11.0, 0, 21.0);
  scene.add(playerGroup);

  // --- CONTROLES Y FÍSICAS DE MOVIMIENTO ---
  const keys = {};

  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  const speed = 0.14;
  const playerRadius = 0.35;

  function updatePlayer() {
    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['arrowup']) moveZ -= 1;
    if (keys['s'] || keys['arrowdown']) moveZ += 1;
    if (keys['a'] || keys['arrowleft']) moveX -= 1;
    if (keys['d'] || keys['arrowright']) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.hypot(moveX, moveZ);
      moveX = (moveX / length) * speed;
      moveZ = (moveZ / length) * speed;

      const newX = playerGroup.position.x + moveX;
      const newZ = playerGroup.position.z + moveZ;

      playerGroup.rotation.y = Math.atan2(moveX, moveZ);

      const playerBoxX = new THREE.Box3(
        new THREE.Vector3(newX - playerRadius, 0, playerGroup.position.z - playerRadius),
        new THREE.Vector3(newX + playerRadius, 1.5, playerGroup.position.z + playerRadius)
      );

      const playerBoxZ = new THREE.Box3(
        new THREE.Vector3(playerGroup.position.x - playerRadius, 0, newZ - playerRadius),
        new THREE.Vector3(playerGroup.position.x + playerRadius, 1.5, newZ + playerRadius)
      );

      let canMoveX = true;
      let canMoveZ = true;

      for (const box of colliders) {
        if (box.intersectsBox(playerBoxX)) canMoveX = false;
        if (box.intersectsBox(playerBoxZ)) canMoveZ = false;
      }

      if (canMoveX) playerGroup.position.x = newX;
      if (canMoveZ) playerGroup.position.z = newZ;
    }

    camera.position.x = playerGroup.position.x;
    camera.position.z = playerGroup.position.z + 10;
    camera.position.y = 11;
    camera.lookAt(playerGroup.position.x, 0.8, playerGroup.position.z);
  }

  // --- ETIQUETAS ---
  makeLabel('ARCADE', ARCADE_X / 2, 2.5, 2.0);
  makeLabel('BIBLIOTECA MANGA', (MANGA_X + ROOM.w) / 2, 2.5, 2.0);
  makeLabel('CAFETERÍA', (ARCADE_X + MANGA_X) / 2, 2.5, 11.0);

  // --- RESIZE ---
  function resize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(mount);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  // --- GAME LOOP ---
  function animate() {
    requestAnimationFrame(animate);
    updatePlayer();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
  animate();
}

document.addEventListener('DOMContentLoaded', function () {
  initMap3D('map3d-mount');
});