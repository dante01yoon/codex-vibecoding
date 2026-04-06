import * as THREE from 'three';
import './style.css';

const TOTAL_LAPS = 3;
const TRACK_HALF_WIDTH = 10.5;
const ROAD_ELEVATION = 0.08;
const BOOST_ZONES = [
  { start: 0.13, end: 0.17 },
  { start: 0.6, end: 0.645 },
];
const UP = new THREE.Vector3(0, 1, 0);

const AI_DRIVERS = [
  { name: 'SOL', color: '#ff8a3d', accent: '#ffe3af', skill: 1.02, lane: 2.4, progress: 0.02, seed: 1.3 },
  { name: 'NOVA', color: '#2bb3ff', accent: '#d7f5ff', skill: 0.97, lane: -2.7, progress: 0.014, seed: 2.4 },
  { name: 'KITE', color: '#c4f25b', accent: '#effbc7', skill: 1.0, lane: 0.9, progress: 0.008, seed: 3.2 },
  { name: 'EMBER', color: '#ff4765', accent: '#ffd4dc', skill: 1.05, lane: -0.8, progress: 0.002, seed: 4.7 },
];

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="shell">
    <div class="hud">
      <section class="panel brand">
        <p class="eyebrow">3D Circuit / Competitive Arcade</p>
        <h1>Slipstream Run</h1>
        <p>Sunset canyon sprint. Four rivals. Three laps. Hold the racing line and time your nitro.</p>
      </section>

      <section class="panel stats">
        <div class="stat-row">
          <div class="stat-card">
            <span>Position</span>
            <strong id="ui-position">5 / 5</strong>
          </div>
          <div class="stat-card">
            <span>Lap</span>
            <strong id="ui-lap">1 / 3</strong>
          </div>
          <div class="stat-card">
            <span>Speed</span>
            <strong id="ui-speed">000 km/h</strong>
          </div>
          <div class="stat-card">
            <span>Nitro</span>
            <strong id="ui-nitro-text">100%</strong>
          </div>
        </div>
        <div>
          <div class="status-label">Nitro Reserve</div>
          <div class="meter"><div id="ui-nitro-meter" class="meter-fill"></div></div>
        </div>
        <div class="status-copy" id="ui-status">Countdown in progress.</div>
      </section>

      <section class="panel leaderboard">
        <p class="eyebrow">Field</p>
        <div class="leaderboard-list" id="ui-leaderboard"></div>
      </section>

      <section class="panel help">
        <strong>Controls</strong><br />
        WASD / Arrow keys to steer and accelerate. Hold Shift for nitro. Tap R if you need to snap back to the track.
      </section>

      <div id="ui-banner" class="banner hidden">3</div>
    </div>

    <div class="viewport"></div>
  </div>
`;

const viewport = document.querySelector('.viewport');
const ui = {
  position: document.querySelector('#ui-position'),
  lap: document.querySelector('#ui-lap'),
  speed: document.querySelector('#ui-speed'),
  nitroText: document.querySelector('#ui-nitro-text'),
  nitroMeter: document.querySelector('#ui-nitro-meter'),
  status: document.querySelector('#ui-status'),
  leaderboard: document.querySelector('#ui-leaderboard'),
  banner: document.querySelector('#ui-banner'),
};

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.domElement.tabIndex = 0;
renderer.domElement.setAttribute('aria-label', 'Slipstream Run game canvas');
viewport.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#6c5144', 200, 520);

const camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.1,
  1400,
);

const clock = new THREE.Clock();
const keyState = new Set();
const cameraLookTarget = new THREE.Vector3();
const cameraTargetPosition = new THREE.Vector3();
const inputState = {
  hasFocus: false,
};

createSky(scene);
setupLights(scene);

const track = createTrack(scene);
createEnvironment(scene, track);
const race = createRace(scene, track);
updateLeaderboard(race);
updateUi(race, 0);

window.addEventListener('resize', onResize);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
window.addEventListener('focus', syncInputFocusState);
window.addEventListener('blur', onWindowBlur);
document.addEventListener('visibilitychange', syncInputFocusState);
renderer.domElement.addEventListener('pointerdown', requestInputFocus);
renderer.domElement.addEventListener('touchstart', requestInputFocus, {
  passive: true,
});

requestAnimationFrame(() => {
  requestInputFocus();
});

renderer.setAnimationLoop(animate);

function animate() {
  const dt = Math.min(clock.getDelta(), 1 / 30);
  const time = clock.elapsedTime;

  updateRace(race, track, dt, time);
  updateCamera(race.player, dt);
  renderer.render(scene, camera);
}

function updateRace(state, trackData, dt, time) {
  state.countdown = Math.max(0, state.countdown - dt);

  const raceLive = state.countdown === 0;
  updatePlayer(state.player, trackData, dt, raceLive);
  updateOpponents(state, trackData, dt, time, raceLive);
  handleTraffic(state, dt);

  state.standings = getStandings(state);
  state.standings.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  updateUi(state, time);
}

function updatePlayer(player, trackData, dt, raceLive) {
  const frameBefore = findTrackFrame(player.position, trackData, player.searchHint);
  player.searchHint = frameBefore.index;
  const steerInput =
    Number(keyState.has('ArrowRight') || keyState.has('KeyD')) -
    Number(keyState.has('ArrowLeft') || keyState.has('KeyA'));
  const throttleInput =
    Number(keyState.has('ArrowUp') || keyState.has('KeyW')) -
    Number(keyState.has('ArrowDown') || keyState.has('KeyS'));
  const nitroHeld = keyState.has('ShiftLeft') || keyState.has('ShiftRight');

  player.offroad = Math.abs(frameBefore.offset) > TRACK_HALF_WIDTH * 0.9;
  player.onBoostPad =
    isInsideBoostZone(frameBefore.progress) &&
    Math.abs(frameBefore.offset) < TRACK_HALF_WIDTH * 0.6;
  player.nitroActive =
    raceLive && nitroHeld && !player.offroad && player.nitro > 1;

  if (!raceLive) {
    player.speed = THREE.MathUtils.damp(player.speed, 0, 10, dt);
  } else {
    const forwardAcceleration = player.offroad ? 24 : 36;
    const brakeAcceleration = 48;

    if (throttleInput > 0) {
      player.speed += forwardAcceleration * dt;
    } else if (throttleInput < 0) {
      player.speed -= brakeAcceleration * dt;
    } else {
      const drag = player.offroad ? 8.5 : 4.1;
      player.speed = THREE.MathUtils.damp(player.speed, 0, drag, dt);
    }

    if (player.nitroActive) {
      player.nitro = Math.max(0, player.nitro - 38 * dt);
      player.speed += 44 * dt;
    } else {
      const refill = player.offroad ? 7 : 12;
      player.nitro = Math.min(100, player.nitro + refill * dt);
    }

    if (player.onBoostPad) {
      player.speed += 28 * dt;
    }

    const speedFactor = THREE.MathUtils.clamp(Math.abs(player.speed) / 48, 0, 1);
    const steeringForce = (player.offroad ? 1.1 : 1.45) * (0.35 + speedFactor);
    player.heading +=
      steerInput *
      steeringForce *
      dt *
      (player.speed >= 0 ? 1 : -0.68);
  }

  const maxForward = player.offroad
    ? 38
    : player.nitroActive
      ? 93
      : player.onBoostPad
        ? 82
        : 71;
  player.speed = THREE.MathUtils.clamp(player.speed, -22, maxForward);

  const forward = new THREE.Vector3(
    Math.sin(player.heading),
    0,
    Math.cos(player.heading),
  );
  player.position.addScaledVector(forward, player.speed * dt);

  const frame = findTrackFrame(player.position, trackData, player.searchHint);
  player.searchHint = frame.index;
  player.progress = frame.progress;
  player.offroad = Math.abs(frame.offset) > TRACK_HALF_WIDTH * 0.9;
  player.onBoostPad =
    isInsideBoostZone(frame.progress) &&
    Math.abs(frame.offset) < TRACK_HALF_WIDTH * 0.6;

  if (Math.abs(frame.offset) > TRACK_HALF_WIDTH + 2.1) {
    const pullBack = (Math.abs(frame.offset) - (TRACK_HALF_WIDTH + 2.1)) * 7 * dt;
    player.position.addScaledVector(frame.right, -Math.sign(frame.offset) * pullBack);
    player.speed *= 0.988;
  }

  if (Math.abs(frame.offset) > TRACK_HALF_WIDTH * 2.1) {
    player.position.copy(frame.point).addScaledVector(frame.right, Math.sign(frame.offset) * 4.4);
    player.speed *= 0.65;
    player.heading = Math.atan2(frame.tangent.x, frame.tangent.z);
  }

  player.position.y = 0.46;

  if (!player.finishOrder) {
    player.lapPeak = Math.max(player.lapPeak, player.progress);
    if (
      player.lastProgress > 0.85 &&
      player.progress < 0.15 &&
      player.lapPeak > 0.9
    ) {
      player.lap += 1;
      player.lapPeak = player.progress;
      if (player.lap > TOTAL_LAPS) {
        finishRacer(player, race, clock.elapsedTime);
      }
    }
  }

  player.lastProgress = player.progress;

  const lean = THREE.MathUtils.clamp(
    -steerInput * (Math.abs(player.speed) / 75) * 0.36,
    -0.22,
    0.22,
  );
  const pitch = THREE.MathUtils.clamp(
    (throttleInput > 0 ? -0.04 : throttleInput < 0 ? 0.05 : 0) +
      (player.nitroActive ? -0.02 : 0),
    -0.08,
    0.08,
  );
  const steeringVisual = steerInput * 0.3;

  syncRacerVisual(player, dt, lean, pitch, steeringVisual);
}

function updateOpponents(state, trackData, dt, time, raceLive) {
  for (const racer of state.opponents) {
    racer.progress = normalizeProgress(racer.progress, racer.lastProgress ?? 0);
    racer.speed = finiteNumber(racer.speed, 0);
    const seed = finiteNumber(racer.seed, 0);
    const skill = finiteNumber(racer.skill, 1);
    const baseLane = finiteNumber(racer.baseLane, 0);

    const paceTarget = raceLive
      ? 47 + skill * 10 + Math.sin(time * 0.85 + seed) * 2.2
      : 0;
    const boostBonus = isInsideBoostZone(racer.progress) ? 6 : 0;
    racer.speed = THREE.MathUtils.damp(
      racer.speed,
      paceTarget + boostBonus,
      raceLive ? 2.2 : 10,
      dt,
    );

    if (raceLive) {
      const nextProgress = wrap01(racer.progress + (racer.speed * dt) / trackData.totalLength);
      if (!racer.finishOrder && nextProgress < racer.progress && racer.progress > 0.7) {
        racer.lap += 1;
        if (racer.lap > TOTAL_LAPS) {
          finishRacer(racer, state, clock.elapsedTime);
        }
      }
      racer.progress = nextProgress;
    }

    const frame = sampleTrack(trackData, racer.progress);
    const laneWave =
      Math.sin(time * 0.56 + seed * 1.4) * 1.4 +
      Math.sin(time * 1.17 + seed) * 0.7;
    const lateralOffset = THREE.MathUtils.clamp(
      baseLane + laneWave,
      -TRACK_HALF_WIDTH * 0.55,
      TRACK_HALF_WIDTH * 0.55,
    );

    racer.position.copy(frame.point).addScaledVector(frame.right, lateralOffset);
    racer.position.y = 0.46;
    racer.heading = Math.atan2(frame.tangent.x, frame.tangent.z);
    racer.lastProgress = racer.progress;

    const lean = THREE.MathUtils.clamp(-laneWave * 0.05, -0.18, 0.18);
    const pitch = racer.speed > 58 ? -0.025 : 0;
    syncRacerVisual(racer, dt, lean, pitch, laneWave * 0.05);
  }
}

function handleTraffic(state, dt) {
  const { player } = state;

  for (const rival of state.opponents) {
    const separation = new THREE.Vector3().subVectors(player.position, rival.position);
    const distance = separation.length();

    if (distance > 0 && distance < 4.2) {
      separation.normalize();
      const push = (4.2 - distance) * dt * 11;
      player.position.addScaledVector(separation, push);
      player.speed *= 0.985;
    }
  }
}

function syncRacerVisual(racer, dt, lean, pitch, steering) {
  racer.group.position.copy(racer.position);
  racer.group.rotation.y = racer.heading;
  racer.visual.rotation.z = THREE.MathUtils.damp(racer.visual.rotation.z, lean, 10, dt);
  racer.visual.rotation.x = THREE.MathUtils.damp(racer.visual.rotation.x, pitch, 10, dt);

  for (const pivot of racer.frontWheelPivots) {
    pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, steering, 12, dt);
  }

  const wheelSpin = racer.speed * dt * 1.45;
  for (const wheel of racer.wheels) {
    wheel.rotation.x -= wheelSpin;
  }

  racer.glow.material.opacity = THREE.MathUtils.damp(
    racer.glow.material.opacity,
    racer.isPlayer && racer.nitroActive ? 0.45 : 0.18,
    10,
    dt,
  );
}

function updateCamera(player, dt) {
  const forward = new THREE.Vector3(Math.sin(player.heading), 0, Math.cos(player.heading));
  cameraTargetPosition
    .copy(player.position)
    .addScaledVector(forward, -8.6)
    .add(new THREE.Vector3(0, 4.25, 0));
  camera.position.lerp(cameraTargetPosition, 1 - Math.pow(0.0009, dt));

  cameraLookTarget
    .copy(player.position)
    .addScaledVector(forward, 13)
    .add(new THREE.Vector3(0, 1.3, 0));
  camera.lookAt(cameraLookTarget);
}

function updateUi(state, time) {
  const player = state.player;
  const standings = state.standings ?? getStandings(state);
  const playerStanding = standings.find((entry) => entry === player) ?? player;
  const leader = standings[0];
  syncInputFocusState();

  ui.position.textContent = `${playerStanding.rank} / ${standings.length}`;
  ui.lap.textContent = `${Math.min(player.lap, TOTAL_LAPS)} / ${TOTAL_LAPS}`;
  ui.speed.textContent = `${String(Math.max(0, Math.round(player.speed * 4.2))).padStart(3, '0')} km/h`;
  ui.nitroText.textContent = `${Math.round(player.nitro)}%`;
  ui.nitroMeter.style.transform = `scaleX(${THREE.MathUtils.clamp(player.nitro / 100, 0, 1)})`;

  if (state.countdown > 1) {
    ui.status.textContent = 'Grid locked. Watch the lights.';
  } else if (state.countdown > 0) {
    ui.status.textContent = 'Go on green. Full throttle.';
  } else if (!inputState.hasFocus) {
    ui.status.textContent = 'Click the track once to capture keyboard input.';
  } else if (player.finishOrder) {
    ui.status.textContent = `Race complete. You finished ${ordinal(player.finishOrder)}.`;
  } else if (player.offroad) {
    ui.status.textContent = 'Offroad drag. Return to the asphalt.';
  } else if (player.onBoostPad) {
    ui.status.textContent = 'Boost pad engaged.';
  } else if (player.nitroActive) {
    ui.status.textContent = 'Nitro burning. Hold the line.';
  } else {
    const gap = leader === player ? 'You are leading the field.' : `Leader gap ${formatGap((leader.lap - player.lap) + (leader.progress - player.progress))}`;
    ui.status.textContent = gap;
  }

  updateLeaderboard(state);
  updateBanner(state, time);
}

function updateLeaderboard(state) {
  const standings = state.standings ?? getStandings(state);
  const leaderMetric = getRaceMetric(standings[0]);

  ui.leaderboard.innerHTML = standings
    .map((entry) => {
      const metric = getRaceMetric(entry);
      const gapText =
        entry === standings[0]
          ? 'LEADER'
          : formatGap(leaderMetric - metric);

      return `
        <div class="leaderboard-row ${entry.isPlayer ? 'is-player' : ''}">
          <div class="rank">${entry.rank ?? ''}</div>
          <div>
            <strong class="driver">${entry.name}</strong>
            <small>Lap ${Math.min(entry.lap, TOTAL_LAPS)} / ${TOTAL_LAPS}</small>
          </div>
          <div class="gap">${gapText}</div>
        </div>
      `;
    })
    .join('');
}

function updateBanner(state, time) {
  if (state.player.finishOrder) {
    ui.banner.textContent = `${ordinal(state.player.finishOrder)} Place`;
    ui.banner.classList.add('visible');
    ui.banner.classList.remove('hidden');
    return;
  }

  if (state.countdown > 1) {
    ui.banner.textContent = `${Math.ceil(state.countdown - 1)}`;
    ui.banner.classList.add('visible');
    ui.banner.classList.remove('hidden');
    return;
  }

  if (state.countdown > 0) {
    ui.banner.textContent = 'GO';
    ui.banner.classList.add('visible');
    ui.banner.classList.remove('hidden');
    return;
  }

  if (time < 5.2) {
    ui.banner.textContent = 'GO';
    ui.banner.classList.add('visible');
    ui.banner.classList.remove('hidden');
    return;
  }

  ui.banner.classList.remove('visible');
  ui.banner.classList.add('hidden');
}

function createRace(scene, trackData) {
  const player = createRacer(scene, {
    name: 'YOU',
    color: '#f4efe3',
    accent: '#ffbe63',
    lane: -1.4,
    progress: 0.026,
    isPlayer: true,
    seed: 0.2,
  });

  const opponents = AI_DRIVERS.map((driver) =>
    createRacer(scene, {
      name: driver.name,
      color: driver.color,
      accent: driver.accent,
      lane: driver.lane,
      progress: driver.progress,
      skill: driver.skill,
      seed: driver.seed,
    }),
  );

  const racers = [player, ...opponents];
  for (const racer of racers) {
    const frame = sampleTrack(trackData, racer.progress);
    racer.position.copy(frame.point).addScaledVector(frame.right, racer.baseLane);
    racer.position.y = 0.46;
    racer.heading = Math.atan2(frame.tangent.x, frame.tangent.z);
    racer.group.position.copy(racer.position);
    racer.group.rotation.y = racer.heading;
  }

  return {
    countdown: 4,
    finishCount: 0,
    player,
    opponents,
    racers,
    standings: racers,
  };
}

function createRacer(scene, config) {
  const model = buildCarModel(config.color, config.accent, config.name);
  scene.add(model.group);
  const initialProgress = normalizeProgress(config.progress, 0);

  return {
    ...model,
    name: config.name,
    isPlayer: Boolean(config.isPlayer),
    skill: config.skill ?? 1,
    seed: config.seed ?? 0,
    baseLane: config.lane,
    progress: initialProgress,
    lastProgress: initialProgress,
    lapPeak: initialProgress,
    lap: 1,
    rank: 1,
    heading: 0,
    speed: 0,
    nitro: 100,
    nitroActive: false,
    offroad: false,
    onBoostPad: false,
    finishOrder: null,
    searchHint: 0,
    position: new THREE.Vector3(),
  };
}

function buildCarModel(colorHex, accentHex, labelText) {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 28),
    new THREE.MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.22,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  shadow.scale.set(1.4, 2.05, 1);
  group.add(shadow);

  const visual = new THREE.Group();
  group.add(visual);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    metalness: 0.28,
    roughness: 0.34,
    emissive: new THREE.Color(colorHex).multiplyScalar(0.07),
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentHex),
    metalness: 0.4,
    roughness: 0.18,
    emissive: new THREE.Color(accentHex).multiplyScalar(0.06),
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#7fb6c9',
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.72,
    transmission: 0.15,
    clearcoat: 0.9,
  });

  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.7, 4.55),
    bodyMaterial,
  );
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  chassis.position.y = 0.58;
  visual.add(chassis);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.58, 1.95),
    glassMaterial,
  );
  roof.castShadow = true;
  roof.position.set(0, 1.05, -0.08);
  visual.add(roof);

  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.86, 0.24, 1.34),
    accentMaterial,
  );
  hood.castShadow = true;
  hood.position.set(0, 0.84, 1.12);
  visual.add(hood);

  const rearDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.92, 0.2, 1.05),
    accentMaterial,
  );
  rearDeck.castShadow = true;
  rearDeck.position.set(0, 0.84, -1.34);
  visual.add(rearDeck);

  const spoiler = new THREE.Group();
  const spoilerBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.08, 0.38),
    accentMaterial,
  );
  spoilerBar.position.y = 0.12;
  spoiler.add(spoilerBar);
  for (const x of [-0.54, 0.54]) {
    const strut = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.24, 0.08),
      accentMaterial,
    );
    strut.position.set(x, -0.02, 0);
    spoiler.add(strut);
  }
  spoiler.position.set(0, 1.0, -2.02);
  visual.add(spoiler);

  const glow = new THREE.Mesh(
    new THREE.RingGeometry(1.38, 2.16, 32),
    new THREE.MeshBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.05;
  visual.add(glow);

  const frontLight = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.07, 0.07),
    new THREE.MeshStandardMaterial({
      color: '#ffe4ac',
      emissive: '#ffd175',
      emissiveIntensity: 1.3,
      metalness: 0.2,
      roughness: 0.3,
    }),
  );
  frontLight.position.set(0, 0.7, 2.3);
  visual.add(frontLight);

  const rearLight = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.06, 0.06),
    new THREE.MeshStandardMaterial({
      color: '#ff8b8b',
      emissive: '#ff4c68',
      emissiveIntensity: 1.6,
      metalness: 0.2,
      roughness: 0.3,
    }),
  );
  rearLight.position.set(0, 0.68, -2.3);
  visual.add(rearLight);

  const frontWheelPivots = [];
  const wheels = [];
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: '#121416',
    roughness: 0.78,
    metalness: 0.25,
  });
  const wheelHubMaterial = new THREE.MeshStandardMaterial({
    color: '#d3dbdf',
    roughness: 0.35,
    metalness: 0.5,
  });
  const wheelGeometry = new THREE.CylinderGeometry(0.47, 0.47, 0.64, 18);
  const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.67, 12);

  const wheelPositions = [
    [-1.1, 0.47, 1.46, true],
    [1.1, 0.47, 1.46, true],
    [-1.1, 0.47, -1.42, false],
    [1.1, 0.47, -1.42, false],
  ];

  for (const [x, y, z, isFront] of wheelPositions) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    visual.add(pivot);

    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    pivot.add(wheel);
    wheels.push(wheel);

    const hub = new THREE.Mesh(hubGeometry, wheelHubMaterial);
    hub.rotation.z = Math.PI / 2;
    pivot.add(hub);

    if (isFront) {
      frontWheelPivots.push(pivot);
    }
  }

  const label = createNameSprite(labelText, accentHex);
  label.position.set(0, 2.1, 0);
  group.add(label);

  return { group, visual, glow, wheels, frontWheelPivots };
}

function createNameSprite(text, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 88;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(5, 8, 13, 0.76)';
  ctx.fillRect(12, 16, canvas.width - 24, canvas.height - 28);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 16, canvas.width - 24, canvas.height - 28);
  ctx.fillStyle = '#fff9ec';
  ctx.font = '600 38px Teko';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.2, 1.1, 1);
  return sprite;
}

function createTrack(scene) {
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0, 132),
      new THREE.Vector3(94, 0, 112),
      new THREE.Vector3(152, 0, 28),
      new THREE.Vector3(124, 0, -104),
      new THREE.Vector3(20, 0, -148),
      new THREE.Vector3(-106, 0, -118),
      new THREE.Vector3(-148, 0, -24),
      new THREE.Vector3(-120, 0, 96),
    ],
    true,
    'catmullrom',
    0.34,
  );

  const curvePoints = curve.getSpacedPoints(319);
  curvePoints.pop();
  const trackData = buildTrackData(curvePoints);

  const sandTexture = createSandTexture();
  sandTexture.wrapS = THREE.RepeatWrapping;
  sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(36, 36);

  const shoulderMaterial = new THREE.MeshStandardMaterial({
    color: '#83604a',
    map: sandTexture,
    roughness: 0.94,
    metalness: 0,
  });

  const roadTexture = createRoadTexture();
  roadTexture.wrapS = THREE.RepeatWrapping;
  roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, trackData.totalLength / 22);

  const roadMaterial = new THREE.MeshStandardMaterial({
    color: '#eef1ff',
    map: roadTexture,
    roughness: 0.84,
    metalness: 0.06,
  });

  const shoulder = createRibbonMesh(
    trackData,
    TRACK_HALF_WIDTH + 2.4,
    ROAD_ELEVATION - 0.04,
    shoulderMaterial,
  );
  shoulder.receiveShadow = true;
  scene.add(shoulder);

  const road = createRibbonMesh(trackData, TRACK_HALF_WIDTH, ROAD_ELEVATION, roadMaterial);
  road.receiveShadow = true;
  scene.add(road);

  const laneStripe = createRibbonMesh(
    trackData,
    0.35,
    ROAD_ELEVATION + 0.01,
    new THREE.MeshBasicMaterial({
      color: '#f4e7c6',
      transparent: true,
      opacity: 0.62,
    }),
  );
  scene.add(laneStripe);

  const startLine = createStartLine(trackData);
  scene.add(startLine);

  const arch = createArch(trackData, 0, 'START');
  scene.add(arch);
  const splitArch = createArch(trackData, 0.57, 'RIDGE');
  scene.add(splitArch);

  createBoostPads(scene, trackData);
  createEdgeMarkers(scene, trackData);

  return trackData;
}

function createEnvironment(scene, trackData) {
  const groundTexture = createSandTexture();
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(84, 84);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1800, 1800),
    new THREE.MeshStandardMaterial({
      color: '#b3815a',
      map: groundTexture,
      roughness: 0.98,
      metalness: 0,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(46, 48),
    new THREE.MeshBasicMaterial({
      color: '#ffd58b',
      transparent: true,
      opacity: 0.84,
    }),
  );
  sun.position.set(-230, 140, -330);
  scene.add(sun);

  const haze = new THREE.Mesh(
    new THREE.CircleGeometry(70, 48),
    new THREE.MeshBasicMaterial({
      color: '#ff9d5a',
      transparent: true,
      opacity: 0.16,
    }),
  );
  haze.position.copy(sun.position);
  haze.position.z += 1;
  scene.add(haze);

  addMountains(scene);
  addTracksideProps(scene, trackData);
}

function createSky(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#08101e');
  gradient.addColorStop(0.42, '#4b2e2a');
  gradient.addColorStop(0.72, '#d87c42');
  gradient.addColorStop(1, '#f2c97a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 90; i += 1) {
    const x = seeded(i * 2.31) * canvas.width;
    const y = seeded(i * 4.79 + 2.1) * canvas.height * 0.55;
    const radius = 2 + seeded(i * 6.37 + 9.2) * 3.5;
    ctx.fillStyle = `rgba(255,255,255,${0.05 + seeded(i * 9.17) * 0.12})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 32),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    }),
  );
  scene.add(sky);
}

function setupLights(scene) {
  const hemisphere = new THREE.HemisphereLight('#a5d3ff', '#8f5c38', 2.8);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight('#ffe3af', 2.9);
  sun.position.set(130, 180, 90);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -220;
  sun.shadow.camera.right = 220;
  sun.shadow.camera.top = 220;
  sun.shadow.camera.bottom = -220;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 520;
  scene.add(sun);

  const fill = new THREE.DirectionalLight('#ff9157', 1.1);
  fill.position.set(-110, 70, -140);
  scene.add(fill);
}

function createBoostPads(scene, trackData) {
  const material = new THREE.MeshStandardMaterial({
    color: '#fff2ad',
    emissive: '#ff8a42',
    emissiveIntensity: 1.6,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  for (const zone of BOOST_ZONES) {
    for (let progress = zone.start; progress < zone.end; progress += 0.009) {
      const frame = sampleTrack(trackData, progress);
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5.4), material);
      pad.position.copy(frame.point);
      pad.position.y = ROAD_ELEVATION + 0.03;
      pad.rotation.x = -Math.PI / 2;
      pad.rotation.z = -Math.atan2(frame.tangent.x, frame.tangent.z);
      scene.add(pad);
    }
  }
}

function createEdgeMarkers(scene, trackData) {
  const markerMaterial = new THREE.MeshStandardMaterial({
    color: '#ffd99d',
    emissive: '#ff8a3d',
    emissiveIntensity: 0.7,
    roughness: 0.4,
    metalness: 0.2,
  });

  for (let i = 0; i < trackData.count; i += 10) {
    const frame = {
      point: trackData.points[i],
      right: trackData.pointRights[i],
      tangent: trackData.pointTangents[i],
    };

    for (const side of [-1, 1]) {
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.9, 0.35),
        markerMaterial,
      );
      marker.position.copy(frame.point).addScaledVector(frame.right, side * (TRACK_HALF_WIDTH + 1.5));
      marker.position.y = 0.52;
      marker.castShadow = true;
      marker.rotation.y = Math.atan2(frame.tangent.x, frame.tangent.z);
      scene.add(marker);
    }
  }
}

function createStartLine(trackData) {
  const frame = sampleTrack(trackData, 0);
  const texture = createCheckeredTexture();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);

  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_HALF_WIDTH * 1.9, 7.2),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );

  line.position.copy(frame.point);
  line.position.y = ROAD_ELEVATION + 0.02;
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = -Math.atan2(frame.tangent.x, frame.tangent.z);
  return line;
}

function createArch(trackData, progress, label) {
  const frame = sampleTrack(trackData, progress);
  const heading = Math.atan2(frame.tangent.x, frame.tangent.z);
  const group = new THREE.Group();
  group.position.copy(frame.point);
  group.position.y = 0;
  group.rotation.y = heading;

  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: '#1a202d',
    roughness: 0.35,
    metalness: 0.42,
    emissive: '#ff6a3d',
    emissiveIntensity: 0.14,
  });
  const beamMaterial = new THREE.MeshStandardMaterial({
    color: '#ffbe63',
    emissive: '#ff8a3d',
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.4,
  });

  for (const x of [-TRACK_HALF_WIDTH - 2, TRACK_HALF_WIDTH + 2]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 1.2), pillarMaterial);
    pillar.position.set(x, 4, 0);
    pillar.castShadow = true;
    group.add(pillar);
  }

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(TRACK_HALF_WIDTH * 2 + 5.2, 1.1, 1.2),
    beamMaterial,
  );
  beam.position.set(0, 8, 0);
  beam.castShadow = true;
  group.add(beam);

  const sprite = createNameSprite(label, '#ffbe63');
  sprite.position.set(0, 8.15, 0.72);
  sprite.scale.set(5.4, 1.42, 1);
  group.add(sprite);

  return group;
}

function addMountains(scene) {
  const mountainGroup = new THREE.Group();
  const colors = ['#5e463d', '#6c4b3c', '#755342'];

  for (let i = 0; i < 26; i += 1) {
    const angle = (i / 26) * Math.PI * 2;
    const radius = 400 + seeded(i * 0.71 + 12) * 140;
    const height = 90 + seeded(i * 1.12 + 5) * 160;
    const width = 38 + seeded(i * 2.4 + 3.1) * 48;

    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(width, height, 6),
      new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 1,
        metalness: 0,
      }),
    );

    mountain.position.set(Math.cos(angle) * radius, height / 2 - 10, Math.sin(angle) * radius);
    mountain.rotation.y = seeded(i * 4.7) * Math.PI;
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    mountainGroup.add(mountain);
  }

  scene.add(mountainGroup);
}

function addTracksideProps(scene, trackData) {
  const rockMaterials = [
    new THREE.MeshStandardMaterial({ color: '#7f5b47', roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: '#92664e', roughness: 0.92 }),
    new THREE.MeshStandardMaterial({ color: '#60463b', roughness: 0.98 }),
  ];
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#202531',
    roughness: 0.32,
    metalness: 0.4,
    emissive: '#8fe7ff',
    emissiveIntensity: 0.16,
  });

  for (let i = 0; i < 110; i += 1) {
    const progress = seeded(i * 7.13 + 4.2);
    const frame = sampleTrack(trackData, progress);
    const side = seeded(i * 5.31 + 9.4) > 0.5 ? 1 : -1;
    const offset = TRACK_HALF_WIDTH + 18 + seeded(i * 8.91 + 1.8) * 68;
    const position = frame.point
      .clone()
      .addScaledVector(frame.right, side * offset);
    position.y = 0;

    if (i % 5 === 0) {
      const tower = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 9.5, 8),
        towerMaterial,
      );
      pole.position.y = 4.75;
      pole.castShadow = true;
      tower.add(pole);

      const lightHead = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.55, 0.8),
        new THREE.MeshStandardMaterial({
          color: '#ffd39a',
          emissive: '#ff8b42',
          emissiveIntensity: 1.4,
          roughness: 0.22,
          metalness: 0.3,
        }),
      );
      lightHead.position.set(0, 9.1, 0);
      lightHead.castShadow = true;
      tower.add(lightHead);
      tower.position.copy(position);
      scene.add(tower);
      continue;
    }

    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(3 + seeded(i * 1.33 + 2) * 7, 0),
      rockMaterials[i % rockMaterials.length],
    );
    rock.position.copy(position);
    rock.position.y = 2 + seeded(i * 2.17 + 8) * 3.5;
    rock.rotation.set(
      seeded(i * 4.1) * Math.PI,
      seeded(i * 6.4) * Math.PI,
      seeded(i * 2.7) * Math.PI,
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  }
}

function createRibbonMesh(trackData, halfWidth, elevation, material) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i < trackData.count; i += 1) {
    const point = trackData.points[i];
    const right = trackData.pointRights[i];
    const leftPoint = point.clone().addScaledVector(right, -halfWidth);
    const rightPoint = point.clone().addScaledVector(right, halfWidth);

    positions.push(
      leftPoint.x, elevation, leftPoint.z,
      rightPoint.x, elevation, rightPoint.z,
    );
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, trackData.distances[i] / 18, 1, trackData.distances[i] / 18);
  }

  for (let i = 0; i < trackData.count; i += 1) {
    const next = (i + 1) % trackData.count;
    const a = i * 2;
    const b = a + 1;
    const c = next * 2;
    const d = c + 1;

    indices.push(a, c, b, b, c, d);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return new THREE.Mesh(geometry, material);
}

function buildTrackData(points) {
  const count = points.length;
  const distances = new Array(count).fill(0);
  const segmentLengths = new Array(count).fill(0);
  const segmentTangents = new Array(count);
  const segmentRights = new Array(count);
  const pointTangents = new Array(count);
  const pointRights = new Array(count);

  let totalLength = 0;
  for (let i = 0; i < count; i += 1) {
    const next = (i + 1) % count;
    distances[i] = totalLength;
    segmentLengths[i] = points[i].distanceTo(points[next]);
    totalLength += segmentLengths[i];
    segmentTangents[i] = points[next].clone().sub(points[i]).normalize();
    segmentRights[i] = new THREE.Vector3()
      .crossVectors(UP, segmentTangents[i])
      .normalize();
  }

  for (let i = 0; i < count; i += 1) {
    const prev = (i - 1 + count) % count;
    const next = (i + 1) % count;
    pointTangents[i] = points[next].clone().sub(points[prev]).normalize();
    pointRights[i] = new THREE.Vector3()
      .crossVectors(UP, pointTangents[i])
      .normalize();
  }

  return {
    points,
    count,
    distances,
    segmentLengths,
    segmentTangents,
    segmentRights,
    pointTangents,
    pointRights,
    totalLength,
  };
}

function sampleTrack(trackData, rawProgress) {
  const progress = normalizeProgress(rawProgress, 0);
  const targetDistance = progress * trackData.totalLength;
  let segmentIndex = Math.floor(progress * trackData.count);

  while (trackData.distances[segmentIndex] > targetDistance) {
    segmentIndex = (segmentIndex - 1 + trackData.count) % trackData.count;
  }

  while (
    targetDistance >=
    trackData.distances[segmentIndex] + trackData.segmentLengths[segmentIndex]
  ) {
    segmentIndex = (segmentIndex + 1) % trackData.count;
  }

  const segmentStart = trackData.distances[segmentIndex];
  const t =
    trackData.segmentLengths[segmentIndex] === 0
      ? 0
      : (targetDistance - segmentStart) / trackData.segmentLengths[segmentIndex];
  const point = trackData.points[segmentIndex]
    .clone()
    .lerp(trackData.points[(segmentIndex + 1) % trackData.count], t);

  return {
    index: segmentIndex,
    point,
    tangent: trackData.segmentTangents[segmentIndex].clone(),
    right: trackData.segmentRights[segmentIndex].clone(),
    progress,
  };
}

function findTrackFrame(position, trackData, hintIndex) {
  const indices = [];

  if (typeof hintIndex === 'number') {
    for (let offset = -14; offset <= 14; offset += 1) {
      indices.push((hintIndex + offset + trackData.count) % trackData.count);
    }
  } else {
    for (let i = 0; i < trackData.count; i += 1) {
      indices.push(i);
    }
  }

  let bestDistanceSq = Infinity;
  let bestIndex = 0;
  let bestPoint = null;
  let bestT = 0;

  for (const index of indices) {
    const start = trackData.points[index];
    const end = trackData.points[(index + 1) % trackData.count];
    const projected = projectPointOnSegment(position, start, end);
    const distanceSq = projected.point.distanceToSquared(position);

    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestIndex = index;
      bestPoint = projected.point;
      bestT = projected.t;
    }
  }

  const distance =
    (trackData.distances[bestIndex] +
      trackData.segmentLengths[bestIndex] * bestT) %
    trackData.totalLength;

  return {
    index: bestIndex,
    point: bestPoint,
    tangent: trackData.segmentTangents[bestIndex].clone(),
    right: trackData.segmentRights[bestIndex].clone(),
    progress: distance / trackData.totalLength,
    offset: position.clone().sub(bestPoint).dot(trackData.segmentRights[bestIndex]),
  };
}

function projectPointOnSegment(point, start, end) {
  const segment = end.clone().sub(start);
  const t = THREE.MathUtils.clamp(
    point.clone().sub(start).dot(segment) / segment.lengthSq(),
    0,
    1,
  );

  return {
    t,
    point: start.clone().addScaledVector(segment, t),
  };
}

function finishRacer(racer, state, time) {
  if (racer.finishOrder) {
    return;
  }

  state.finishCount += 1;
  racer.finishOrder = state.finishCount;
  racer.finishTime = time;
}

function getStandings(state) {
  return [...state.racers].sort((a, b) => {
    if (a.finishOrder && b.finishOrder) {
      return a.finishOrder - b.finishOrder;
    }
    if (a.finishOrder) {
      return -1;
    }
    if (b.finishOrder) {
      return 1;
    }
    return getRaceMetric(b) - getRaceMetric(a);
  });
}

function getRaceMetric(racer) {
  const lap = finiteNumber(racer.lap, 1);
  const progress = normalizeProgress(racer.progress, 0);
  return (lap - 1) + progress;
}

function isInsideBoostZone(progress) {
  return BOOST_ZONES.some((zone) => progress >= zone.start && progress <= zone.end);
}

function createRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2d313a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 1800; i += 1) {
    const x = seeded(i * 2.17 + 4.8) * canvas.width;
    const y = seeded(i * 3.73 + 9.1) * canvas.height;
    const alpha = 0.02 + seeded(i * 4.91 + 1.7) * 0.08;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = 'rgba(255, 174, 96, 0.9)';
  ctx.fillRect(8, 0, 3, canvas.height);
  ctx.fillRect(canvas.width - 11, 0, 3, canvas.height);

  ctx.fillStyle = '#f7e7bf';
  for (let y = 0; y < canvas.height; y += 90) {
    ctx.fillRect(canvas.width / 2 - 2, y + 12, 4, 44);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSandTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#bb845b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 3200; i += 1) {
    const x = seeded(i * 2.9 + 4.1) * canvas.width;
    const y = seeded(i * 5.7 + 8.4) * canvas.height;
    const size = 1 + seeded(i * 1.2 + 6.7) * 2;
    const alpha = 0.03 + seeded(i * 9.2 + 0.8) * 0.07;
    ctx.fillStyle = `rgba(69, 34, 16, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCheckeredTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  for (let x = 0; x < 8; x += 1) {
    const color = x % 2 === 0 ? '#121417' : '#f5efe2';
    ctx.fillStyle = color;
    ctx.fillRect(x * 32, 0, 32, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  if (
    [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
      'ShiftLeft',
      'ShiftRight',
    ].includes(event.code)
  ) {
    event.preventDefault();
  }

  if (event.code === 'KeyR') {
    resetPlayerPosition();
  }

  keyState.add(event.code);
  inputState.hasFocus = true;
}

function onKeyUp(event) {
  keyState.delete(event.code);
}

function onWindowBlur() {
  keyState.clear();
  syncInputFocusState();
}

function requestInputFocus() {
  renderer.domElement.focus({ preventScroll: true });
  syncInputFocusState();
}

function syncInputFocusState() {
  inputState.hasFocus = document.hasFocus();
}

function resetPlayerPosition() {
  const frame = findTrackFrame(race.player.position, track, race.player.searchHint);
  race.player.position.copy(frame.point).addScaledVector(frame.right, -1.8);
  race.player.position.y = 0.46;
  race.player.heading = Math.atan2(frame.tangent.x, frame.tangent.z);
  race.player.speed *= 0.3;
}

function wrap01(value) {
  return ((value % 1) + 1) % 1;
}

function normalizeProgress(value, fallback = 0) {
  const safeFallback = finiteNumber(fallback, 0);
  const numeric = finiteNumber(value, safeFallback);
  return wrap01(numeric);
}

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function seeded(seed) {
  return ((Math.sin(seed * 128.33) * 43758.5453123) % 1 + 1) % 1;
}

function ordinal(value) {
  if (value === 1) {
    return '1st';
  }
  if (value === 2) {
    return '2nd';
  }
  if (value === 3) {
    return '3rd';
  }
  return `${value}th`;
}

function formatGap(deltaMetric) {
  const seconds = Math.max(0, finiteNumber(deltaMetric, 0) * 18);
  return `+${seconds.toFixed(1)}s`;
}
