import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const scenes = {
  car: {
    number: '01',
    title: 'Start with a car on a road',
    summary: 'The customer request is the car. The business journey is the road. The OS document is the driving manual.',
    lesson: 'Do not start with architecture words. Start with this: a car should move safely from start to finish without everyone inventing their own traffic rules.',
    camera: [0, 8.5, 15],
    target: [0, 0, 0]
  },
  rules: {
    number: '02',
    title: 'Traffic rules explain laws, boundaries, and guards',
    summary: 'Road laws say what must stay true. Boundaries say which lane owns the decision. Guards block illegal shortcuts.',
    lesson: 'In an OS doc, laws define the truth, boundaries assign ownership, and guards stop the car when someone tries to bypass the owner.',
    camera: [0, 9, 16],
    target: [0, 0, 0]
  },
  checkpoints: {
    number: '03',
    title: 'Checkpoints explain OS ownership',
    summary: 'Each checkpoint has one job. Coverage checks the area. Allocation picks the driver. Lifecycle tracks the trip.',
    lesson: 'An OS is like a checkpoint with one responsibility. It should make its own decision and then pass the car to the next checkpoint.',
    camera: [0, 10, 17],
    target: [0, 0, 0]
  },
  termParameters: {
    number: '04',
    title: 'Parameters',
    summary: 'A parameter is the number on the sign. Same road, same rule, different value.',
    lesson: 'The rule is “obey the speed limit.” The parameter is the number on the sign. Change 30 to 60, and the car can move faster without rebuilding the road.',
    camera: [0, 8.5, 15],
    target: [0, 0, 0]
  },
  termState: {
    number: '05',
    title: 'State machine',
    summary: 'A state machine is like a car wash: Queue → Soap → Rinse → Dry → Done.',
    lesson: 'State = which bay the car is currently in. Transition = the conveyor moving it to the next allowed bay.',
    camera: [0, 9.5, 17],
    target: [0, 0, 0]
  }
};

const palette = {
  asphalt: '#222c34',
  lane: '#f2d36b',
  grass: '#123629',
  teal: '#5fffe1',
  green: '#62d6a4',
  yellow: '#f2b84b',
  red: '#ff735c',
  blue: '#7fc7ff',
  violet: '#c9a7ff',
  white: '#eef8ff',
  paper: '#f4d7a1'
};

const stage = document.querySelector('#stage');
const macroStage = document.querySelector('#macroStage');
const cockroachStage = document.querySelector('#cockroachStage');
const utilityBar = document.querySelector('.utility-bar');
const sceneSummary = document.querySelector('#sceneSummary');
const sceneLesson = document.querySelector('#sceneLesson');
const sceneButtons = document.querySelectorAll('.view-button');
const copyMarkdownButton = document.querySelector('#copyMarkdown');
const markdownModal = document.querySelector('#markdownModal');
const markdownModalEyebrow = document.querySelector('#markdownModalEyebrow');
const markdownModalTitle = document.querySelector('#markdownModalTitle');
const markdownModalBody = document.querySelector('#markdownModalBody');
const modalCloseButtons = document.querySelectorAll('[data-modal-close]');

const threeScene = new THREE.Scene();
threeScene.fog = new THREE.FogExp2(0x05080d, 0.033);

const camera = new THREE.PerspectiveCamera(42, stage.clientWidth / stage.clientHeight, 0.1, 1000);
camera.position.set(0, 8.5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(stage.clientWidth, stage.clientHeight);
labelRenderer.domElement.className = 'label-layer';
stage.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 9;
controls.maxDistance = 28;
controls.maxPolarAngle = Math.PI * 0.82;

const root = new THREE.Group();
threeScene.add(root);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactiveMeshes = [];
const animated = [];
let currentSceneId = 'car';
let lastScrollY = window.scrollY;
let scrollTicking = false;
let keyboardScrollTargetY = window.scrollY;
let keyboardScrollFrame = null;

addLights();
addBackdrop();
setScene('car');
const macroSystem = macroStage ? initMacroScene(macroStage) : null;
const cockroachSystem = cockroachStage ? initCockroachScene(cockroachStage) : null;

sceneButtons.forEach((button) => {
  button.addEventListener('click', () => setScene(button.dataset.scene));
});

copyMarkdownButton?.addEventListener('click', copyMarkdownContext);
modalCloseButtons.forEach((button) => {
  button.addEventListener('click', closeMarkdownModal);
});
window.addEventListener('keydown', onGlobalKeydown);
window.addEventListener('scroll', onWindowScroll, { passive: true });
window.addEventListener('wheel', cancelKeyboardScroll, { passive: true });
window.addEventListener('touchstart', cancelKeyboardScroll, { passive: true });

stage.addEventListener('pointermove', onPointerMove);
stage.addEventListener('click', () => {
  const match = intersect();
  if (match) selectInfo(match.userData.info);
});

window.addEventListener('resize', onResize);
animate();

function setScene(sceneId) {
  currentSceneId = sceneId;
  clearRoot();

  sceneButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.scene === sceneId);
  });

  const config = scenes[sceneId];
  sceneSummary.textContent = config.summary;
  if (sceneLesson) sceneLesson.textContent = config.lesson;

  if (sceneId === 'car') buildCarScene();
  if (sceneId === 'rules') buildRulesScene();
  if (sceneId === 'checkpoints') buildCheckpointScene();
  if (sceneId === 'termParameters') buildParameterTermScene();
  if (sceneId === 'termState') buildStateTermScene();

  camera.position.set(...config.camera);
  controls.target.set(...config.target);
  controls.update();
}

function buildCarScene() {
  const carInfo = info(
    'CAR',
    'Customer request car',
    'What is the car?',
    'The car is one customer request trying to move through Wiom.',
    'It carries simple facts: location, phone number, selected plan, current status.',
    'If the car moves without road rules, every team can pull it in a different direction.'
  );
  const roadInfo = info(
    'ROAD',
    'Business road',
    'What is the road?',
    'The road is the customer journey from request to connected customer.',
    'The road controls the order in which decisions happen.',
    'The OS map is trying to stop chaos on this road.'
  );
  const manualInfo = info(
    'MANUAL',
    'Driving manual',
    'What is the OS document?',
    'It is the driving manual for one part of the road.',
    'It says who decides, what rules apply, what gets recorded, and what is forbidden.',
    'OS document means rulebook for the journey, not computer operating system.'
  );

  addGround();
  const road = addRoad(15, 4.3, 0);
  road.userData.info = roadInfo;
  interactiveMeshes.push(road);

  const car = createCar(carInfo, palette.teal);
  car.position.set(-5.2, 0.45, 0);
  root.add(car);

  const manual = box(2.8, 0.38, 2.0, palette.paper, { x: 4.8, y: 0.28, z: -3.4, rotY: -0.25 });
  manual.userData.info = manualInfo;
  interactiveMeshes.push(manual);
  root.add(manual);

  addRoadSign('START', -7, -2.7, palette.green, roadInfo);
  addRoadSign('CONNECTED', 7, -2.7, palette.yellow, roadInfo);
  animated.push((elapsed) => {
    const phase = loopProgress(elapsed, 0.18);
    car.position.x = THREE.MathUtils.lerp(-5.2, 2.8, phase);
    car.position.y = 0.45 + Math.sin(elapsed * 5) * 0.025;
  });

  selectInfo(carInfo);
}

function buildRulesScene() {
  const lawInfo = info(
    'LAW',
    'Road law',
    'What is the law?',
    'The law is the truth that must always stay true.',
    'Example: demand is system-led; partners do not privately own customers.',
    'In the car story, this is the traffic law every car must obey.'
  );
  const boundaryInfo = info(
    'LANE',
    'Ownership boundary',
    'What is a boundary?',
    'A boundary says which lane or checkpoint owns the decision.',
    'Example: Allocation chooses the partner; Support should not secretly assign one.',
    'Boundaries stop teams from taking shortcuts into each other’s jobs.'
  );
  const guardInfo = info(
    'GUARD',
    'No-entry guard',
    'What is a guard?',
    'A guard is the barrier that blocks the car when it tries to break the law or boundary.',
    'Example: do not assign a customer to two partners at the same time.',
    'Guards are dumb by design: if the move is illegal, block it.'
  );

  addGround();
  addRoad(15, 4.3, 0);
  addGuardRail(-2.5, palette.violet, boundaryInfo);
  addGuardRail(2.5, palette.violet, boundaryInfo);

  addRoadSign('LAW: always true', -5.6, -3.2, palette.green, lawInfo);
  addRoadSign('BOUNDARY: owner lane', -0.7, -3.2, palette.violet, boundaryInfo);
  addRoadSign('GUARD: no shortcut', 4.5, -3.2, palette.red, guardInfo);

  const shortcutRoad = box(6.4, 0.12, 1.2, palette.red, { x: 2.7, y: 0.09, z: 3.05, rotY: -0.42 });
  const guardGate = box(0.32, 1.25, 3.1, palette.red, { x: -0.2, y: 0.68, z: 2.05, rotY: -0.42 });
  [shortcutRoad, guardGate].forEach((part) => {
    part.userData.info = guardInfo;
    interactiveMeshes.push(part);
    root.add(part);
  });
  addLabel('blocked shortcut', 2.8, 0.62, 3.8, 'label label--station');

  const goodCar = createCar(info('CAR', 'Lawful customer car', 'What is happening?', 'This car stays on the official road and passes the boundary correctly.', 'The law is respected, the owner lane is clear, and the guard does nothing.', 'Good systems make the correct path boring.'), palette.teal);
  goodCar.position.set(-5.5, 0.45, 0);
  root.add(goodCar);

  const shortcutCar = createCar(info('BAD', 'Shortcut attempt', 'What is being blocked?', 'This car tries to jump into a lane where the wrong owner would make the decision.', 'That violates the boundary, so the guard blocks it.', 'This is why laws, boundaries, and guards belong in one picture.'), palette.red);
  shortcutCar.position.set(-3.2, 0.45, 1.1);
  shortcutCar.rotation.y = -0.42;
  root.add(shortcutCar);

  animated.push((elapsed) => {
    goodCar.position.x = THREE.MathUtils.lerp(-5.5, 4.6, loopProgress(elapsed, 0.14));

    const badPhase = Math.min(loopProgress(elapsed, 0.18) * 1.45, 1);
    shortcutCar.position.x = THREE.MathUtils.lerp(-3.2, -0.2, badPhase);
    shortcutCar.position.z = THREE.MathUtils.lerp(1.1, 2.25, badPhase);
  });

  selectInfo(boundaryInfo);
}

function buildCheckpointScene() {
  const coverageInfo = checkpointInfo('CC', 'Coverage checkpoint', 'Can this area be served?', 'This checkpoint checks whether the car is on a road Wiom can actually serve.');
  const promiseInfo = checkpointInfo('PROM', 'Promise checkpoint', 'Can we promise service?', 'This checkpoint records a promise only after serviceability is clear.');
  const allocationInfo = checkpointInfo('D&A', 'Assignment checkpoint', 'Who should serve the customer?', 'This checkpoint chooses the partner. Other checkpoints should not secretly do this.');
  const lifecycleInfo = checkpointInfo('CL', 'Journey checkpoint', 'Where is the customer now?', 'This checkpoint updates the official customer journey state.');
  const supportInfo = checkpointInfo('SR', 'Help checkpoint', 'Who fixes a problem?', 'This checkpoint routes issues to the right owner.');

  addGround();
  addRoad(18, 4.3, 0);

  const checkpoints = [
    ['Coverage', -6.5, palette.green, coverageInfo],
    ['Promise', -3.1, palette.teal, promiseInfo],
    ['Assign', 0.3, palette.green, allocationInfo],
    ['Journey', 3.7, palette.yellow, lifecycleInfo],
    ['Help', 7.1, palette.violet, supportInfo]
  ];

  checkpoints.forEach(([label, x, color, infoObject], index) => {
    addCheckpoint(label, x, color, infoObject, index);
  });

  const car = createCar(info('CAR', 'Customer car', 'What is moving?', 'A customer request moving from checkpoint to checkpoint.', 'Each checkpoint adds exactly one official decision.', 'The path is easy when every checkpoint does its own job.'), palette.teal);
  car.position.set(-8.2, 0.45, 0);
  root.add(car);

  animated.push((elapsed) => {
    const phase = loopProgress(elapsed, 0.13);
    car.position.x = THREE.MathUtils.lerp(-8.2, 7.6, phase);
    car.position.y = 0.45 + Math.sin(elapsed * 5) * 0.02;
  });

  selectInfo(allocationInfo);
}

function buildParameterTermScene() {
  const parameterInfo = info(
    'PARAM',
    'Parameter',
    'What is a parameter?',
    'A parameter is a setting value, like the number on a speed-limit sign.',
    'The rule is still the same: obey the sign. Only the number changes.',
    'Keep these numbers in one known place, not hidden inside random code.'
  );
  const slowInfo = info(
    '30',
    'Speed limit 30',
    'What does value = 30 mean?',
    'The same road has a stricter speed setting.',
    'The car still follows the same rule, but it moves slower.',
    'Changing the parameter changes behavior without changing the rule.'
  );
  const fastInfo = info(
    '60',
    'Speed limit 60',
    'What does value = 60 mean?',
    'The same road has a looser speed setting.',
    'The car still follows the same rule, but it can move faster.',
    'Same road. Same rule. Different parameter value.'
  );

  addGround();
  addRoad(15, 1.8, -1.45);
  addRoad(15, 1.8, 1.45);

  addRoadSign('SPEED LIMIT 30', -5.7, -3.35, palette.yellow, slowInfo);
  addRoadSign('SPEED LIMIT 60', -5.7, 3.35, palette.green, fastInfo);

  const knob = cylinder(0.68, 0.38, palette.yellow, { x: 3.8, y: 0.3, z: 0 });
  knob.userData.info = parameterInfo;
  interactiveMeshes.push(knob);
  root.add(knob);
  addLabel('parameter registry', 3.8, 0.95, 0, 'label label--station');

  const slowCar = createCar(info('CAR', 'Car under limit 30', 'What is happening?', 'This car is on the strict setting.', 'The rule is the same, but the parameter value makes it move slower.', 'Parameter value affects behavior.'), palette.teal);
  slowCar.position.set(-6.5, 0.45, -1.45);
  root.add(slowCar);

  const fastCar = createCar(info('CAR', 'Car under limit 60', 'What is happening?', 'This car is on the looser setting.', 'The rule is the same, but the parameter value lets it move faster.', 'The road was not rebuilt; only the sign value changed.'), palette.blue);
  fastCar.position.set(-6.5, 0.45, 1.45);
  root.add(fastCar);

  animated.push((elapsed) => {
    slowCar.position.x = THREE.MathUtils.lerp(-6.5, 6.5, loopProgress(elapsed, 0.08));
    fastCar.position.x = THREE.MathUtils.lerp(-6.5, 6.5, loopProgress(elapsed, 0.18));
    knob.rotation.y = elapsed * 1.1;
  });

  selectInfo(parameterInfo);
}

function buildStateTermScene() {
  const stateInfo = info(
    'STATE',
    'State',
    'What is state?',
    'State is the car-wash bay the car is currently inside.',
    'Examples: Queue, Soap, Rinse, Dry, Done.',
    'If the car is in Soap, it is not also in Dry. One current state at a time.'
  );
  const transitionInfo = info(
    'NEXT',
    'Transition',
    'What is a transition?',
    'A transition is the conveyor moving the car from one bay to the next allowed bay.',
    'Example: Soap can move to Rinse. Rinse can move to Dry.',
    'Transitions are the legal moves.'
  );
  addGround();
  addRoad(18, 3.3, 0);
  const bays = [
    ['Queue', -7.2, palette.blue],
    ['Soap', -3.6, palette.green],
    ['Rinse', 0, palette.teal],
    ['Dry', 3.6, palette.yellow],
    ['Done', 7.2, palette.violet]
  ];

  bays.forEach(([label, x, color], index) => {
    const bay = box(2.25, 0.18, 2.75, color, { x, y: 0.13, z: 0 });
    const archLeft = box(0.12, 1.25, 0.12, color, { x: x - 0.95, y: 0.72, z: -1.2 });
    const archRight = box(0.12, 1.25, 0.12, color, { x: x + 0.95, y: 0.72, z: -1.2 });
    const archTop = box(2.02, 0.12, 0.12, color, { x, y: 1.32, z: -1.2 });
    [bay, archLeft, archRight, archTop].forEach((part) => {
      part.userData.info = stateInfo;
      interactiveMeshes.push(part);
      root.add(part);
    });
    addLabel(label, x, 0.75, 0, 'label label--station');
    if (index < bays.length - 1) {
      const segment = line(new THREE.Vector3(x + 1.2, 0.26, 0), new THREE.Vector3(bays[index + 1][1] - 1.2, 0.26, 0), palette.teal, 0.72);
      segment.userData.info = transitionInfo;
      root.add(segment);
    }
  });

  const car = createCar(info('CAR', 'Car in the wash', 'What is happening?', 'The car moves through the wash bays in the correct order.', 'Each bay is a state. Each conveyor move is a transition.', 'A state machine is just a controlled journey.'), palette.teal);
  car.position.set(-7.2, 0.45, 0);
  root.add(car);

  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-7.2, 7.2, loopProgress(elapsed, 0.11));
  });

  selectInfo(stateInfo);
}

function onWindowScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateUtilityBarVisibility);
}

function onGlobalKeydown(event) {
  if (event.key === 'Escape') {
    closeMarkdownModal();
    return;
  }

  if (shouldIgnoreKeyboardScroll(event)) return;

  const key = event.key.toLowerCase();
  if (key !== 'j' && key !== 'k') return;

  event.preventDefault();
  scrollPageWithKeyboard(key === 'j' ? 1 : -1);
}

function shouldIgnoreKeyboardScroll(event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return true;
  if (markdownModal && !markdownModal.hidden) return true;
  if (!(event.target instanceof HTMLElement)) return false;

  return event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
}

function scrollPageWithKeyboard(direction) {
  const distance = Math.max(280, window.innerHeight * 0.72);
  const baseY = keyboardScrollFrame === null ? window.scrollY : keyboardScrollTargetY;
  keyboardScrollTargetY = clampScrollY(baseY + direction * distance);

  if (keyboardScrollFrame === null) {
    keyboardScrollFrame = requestAnimationFrame(animateKeyboardScroll);
  }
}

function animateKeyboardScroll() {
  const currentY = window.scrollY;
  const deltaY = keyboardScrollTargetY - currentY;

  if (Math.abs(deltaY) < 1) {
    window.scrollTo(0, keyboardScrollTargetY);
    keyboardScrollFrame = null;
    return;
  }

  window.scrollTo(0, currentY + deltaY * 0.2);
  keyboardScrollFrame = requestAnimationFrame(animateKeyboardScroll);
}

function cancelKeyboardScroll() {
  if (keyboardScrollFrame !== null) {
    cancelAnimationFrame(keyboardScrollFrame);
    keyboardScrollFrame = null;
  }
  keyboardScrollTargetY = window.scrollY;
}

function clampScrollY(scrollY) {
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(scrollY, 0), maxScrollY);
}

function updateUtilityBarVisibility() {
  const currentScrollY = window.scrollY;
  const scrolledDown = currentScrollY > lastScrollY + 8;
  const scrolledUp = currentScrollY < lastScrollY - 4;
  const nearTop = currentScrollY < 48;

  if (utilityBar) {
    if (nearTop || scrolledUp) {
      utilityBar.classList.remove('is-hidden');
    } else if (scrolledDown && currentScrollY > 120) {
      utilityBar.classList.add('is-hidden');
    }
  }

  lastScrollY = Math.max(currentScrollY, 0);
  scrollTicking = false;
}

async function copyMarkdownContext() {
  try {
    const response = await fetch('/wiom-os.md', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load wiom-os.md: ${response.status}`);
    const markdown = await response.text();
    await writeClipboard(markdown);
    openMarkdownModal({
      eyebrow: 'Copied context',
      title: 'wiom-os.md is on your clipboard',
      body: 'You can paste this .md file into ChatGPT, Claude, or Gemini to give it context about Wiom OS.'
    });
  } catch (error) {
    console.error(error);
    openMarkdownModal({
      eyebrow: 'Copy failed',
      title: 'Could not copy wiom-os.md',
      body: 'Open wiom-os.md from the sticky header and copy it manually into ChatGPT, Claude, or Gemini.'
    });
  }
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function openMarkdownModal(copy) {
  if (!markdownModal) return;
  if (markdownModalEyebrow) markdownModalEyebrow.textContent = copy.eyebrow;
  if (markdownModalTitle) markdownModalTitle.textContent = copy.title;
  if (markdownModalBody) markdownModalBody.textContent = copy.body;
  markdownModal.hidden = false;
  document.body.classList.add('has-modal');
  markdownModal.querySelector('button')?.focus();
}

function closeMarkdownModal() {
  if (!markdownModal || markdownModal.hidden) return;
  markdownModal.hidden = true;
  document.body.classList.remove('has-modal');
  copyMarkdownButton?.focus();
}

function initCockroachScene(container) {
  const cockroachScene = new THREE.Scene();
  cockroachScene.fog = new THREE.FogExp2(0x05080d, 0.04);

  const cockroachCamera = new THREE.PerspectiveCamera(46, container.clientWidth / container.clientHeight, 0.1, 1000);
  cockroachCamera.position.set(0, 7.6, 8.8);
  cockroachCamera.lookAt(0, 0, 0);

  const cockroachRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  cockroachRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cockroachRenderer.setSize(container.clientWidth, container.clientHeight);
  cockroachRenderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(cockroachRenderer.domElement);

  const cockroachLabelRenderer = new CSS2DRenderer();
  cockroachLabelRenderer.setSize(container.clientWidth, container.clientHeight);
  cockroachLabelRenderer.domElement.className = 'label-layer label-layer--cockroach';
  container.appendChild(cockroachLabelRenderer.domElement);

  cockroachScene.add(new THREE.AmbientLight(0xc5dcff, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(4, 8, 6);
  cockroachScene.add(key);
  const pinkRim = new THREE.PointLight(0xe5178f, 12, 28);
  pinkRim.position.set(-4.5, 3.5, 2.8);
  cockroachScene.add(pinkRim);

  const cockroachRoot = new THREE.Group();
  cockroachRoot.rotation.x = -0.22;
  cockroachScene.add(cockroachRoot);

  const ground = box(8.6, 0.035, 5.4, palette.grass, { y: -0.08, opacity: 0.42 });
  cockroachRoot.add(ground);
  const grid = new THREE.GridHelper(8.5, 12, 0x352340, 0x102434);
  grid.position.y = -0.04;
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  cockroachRoot.add(grid);

  const shellColor = '#7a3f26';
  const shellDark = '#2b1715';
  const amber = '#d49a4a';
  const bodyParts = [];
  const bobBaseHeights = [];
  const feelers = [];

  const abdomen = sphere(1, shellColor, { y: 0.42 });
  abdomen.scale.set(1.18, 0.34, 1.72);
  abdomen.rotation.y = 0.02;
  bodyParts.push(abdomen);
  bobBaseHeights.push(abdomen.position.y);
  cockroachRoot.add(abdomen);

  const thorax = sphere(0.78, '#9a5530', { x: 0, y: 0.47, z: -1.15 });
  thorax.scale.set(1.12, 0.34, 0.95);
  bodyParts.push(thorax);
  bobBaseHeights.push(thorax.position.y);
  cockroachRoot.add(thorax);

  const head = sphere(0.5, amber, { x: 0, y: 0.5, z: -2.02 });
  head.scale.set(0.92, 0.32, 0.68);
  bodyParts.push(head);
  bobBaseHeights.push(head.position.y);
  cockroachRoot.add(head);

  const spine = box(0.08, 0.08, 3.35, palette.yellow, { x: 0, y: 0.82, z: -0.2, opacity: 0.72 });
  cockroachRoot.add(spine);

  [-0.52, 0.52].forEach((x) => {
    const stripe = box(0.035, 0.06, 2.75, shellDark, { x, y: 0.78, z: 0.15, opacity: 0.56 });
    stripe.rotation.z = x > 0 ? -0.08 : 0.08;
    cockroachRoot.add(stripe);
  });

  [
    [-1.22, -1.24, -2.25, -2.06],
    [1.22, 1.24, 2.25, -2.06],
    [-1.05, -0.48, -2.45, -0.85],
    [1.05, 0.48, 2.45, -0.85],
    [-1.04, 0.42, -2.35, 0.48],
    [1.04, 0.42, 2.35, 0.48],
    [-0.88, 1.1, -1.85, 1.64],
    [0.88, 1.1, 1.85, 1.64]
  ].forEach(([x1, z1, x2, z2], index) => {
    const leg = tubePath(
      [
        new THREE.Vector3(x1 * 0.55, 0.42, z1),
        new THREE.Vector3(x1, 0.3, (z1 + z2) / 2),
        new THREE.Vector3(x2, 0.22, z2)
      ],
      index < 4 ? palette.teal : palette.blue,
      0.035
    );
    cockroachRoot.add(leg);
  });

  [
    [0.18, -2.34, 1.9, -3.35],
    [-0.18, -2.34, -1.9, -3.35]
  ].forEach(([x1, z1, x2, z2], index) => {
    const feeler = tubePath(
      [
        new THREE.Vector3(x1, 0.56, z1),
        new THREE.Vector3(x2 * 0.45, 0.8, -2.95),
        new THREE.Vector3(x2, 0.68, z2)
      ],
      index === 0 ? palette.green : palette.violet,
      0.025
    );
    feelers.push(feeler);
    cockroachRoot.add(feeler);
  });

  addMacroLabel(cockroachRoot, 'OWNED TRUTH', 0, 1.3, -2.15, 'label label--cockroach');
  addMacroLabel(cockroachRoot, 'STATE MACHINE', 0, 1.32, -0.12, 'label label--cockroach');
  addMacroLabel(cockroachRoot, 'INPUTS', -2.55, 0.72, -0.7, 'label label--cockroach');
  addMacroLabel(cockroachRoot, 'OUTPUTS', 2.55, 0.72, -0.7, 'label label--cockroach');
  addMacroLabel(cockroachRoot, 'INVARIANT SHELL', 0, 1.16, 1.4, 'label label--cockroach');
  addMacroLabel(cockroachRoot, 'AUDIT TRAIL', 0, 0.48, 2.55, 'label label--caption');

  function tubePath(points, colorValue, radius) {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, radius, 8, false),
      new THREE.MeshStandardMaterial({
        color: colorValue,
        emissive: new THREE.Color(colorValue).multiplyScalar(0.2),
        roughness: 0.42,
        metalness: 0.12
      })
    );
  }

  return {
    resize() {
      cockroachCamera.aspect = container.clientWidth / container.clientHeight;
      cockroachCamera.updateProjectionMatrix();
      cockroachRenderer.setSize(container.clientWidth, container.clientHeight);
      cockroachLabelRenderer.setSize(container.clientWidth, container.clientHeight);
    },
    tick(elapsed) {
      cockroachRoot.rotation.y = Math.sin(elapsed * 0.35) * 0.18;
      bodyParts.forEach((part, index) => {
        part.position.y = bobBaseHeights[index] + Math.sin(elapsed * 1.8 + index) * 0.018;
      });
      feelers.forEach((feeler, index) => {
        feeler.rotation.y = Math.sin(elapsed * 1.4 + index) * 0.08;
      });
      cockroachRenderer.render(cockroachScene, cockroachCamera);
      cockroachLabelRenderer.render(cockroachScene, cockroachCamera);
    }
  };
}

function initMacroScene(container) {
  const macroScene = new THREE.Scene();
  macroScene.fog = new THREE.FogExp2(0x05080d, 0.028);

  const macroCamera = new THREE.PerspectiveCamera(44, container.clientWidth / container.clientHeight, 0.1, 1000);
  macroCamera.position.set(0, 10.5, 15.5);
  macroCamera.lookAt(0, 0, 0);

  const macroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  macroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  macroRenderer.setSize(container.clientWidth, container.clientHeight);
  macroRenderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(macroRenderer.domElement);

  const macroLabelRenderer = new CSS2DRenderer();
  macroLabelRenderer.setSize(container.clientWidth, container.clientHeight);
  macroLabelRenderer.domElement.className = 'label-layer label-layer--macro';
  container.appendChild(macroLabelRenderer.domElement);

  macroScene.add(new THREE.AmbientLight(0xc5dcff, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(8, 13, 10);
  macroScene.add(key);
  const rim = new THREE.PointLight(0x5fffe1, 10, 44);
  rim.position.set(-7, 6, -8);
  macroScene.add(rim);

  const macroRoot = new THREE.Group();
  macroScene.add(macroRoot);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    starPositions[i * 3] = (Math.random() - 0.5) * 56;
    starPositions[i * 3 + 1] = (Math.random() - 0.1) * 26;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 56;
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  macroScene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x8db4ff, size: 0.028, transparent: true, opacity: 0.32 })
    )
  );

  const ground = box(16, 0.04, 11, palette.grass, { y: -0.08 });
  ground.material.opacity = 0.5;
  ground.material.transparent = true;
  macroRoot.add(ground);

  const grid = new THREE.GridHelper(16, 16, 0x23445c, 0x102434);
  grid.position.y = -0.03;
  grid.material.opacity = 0.22;
  grid.material.transparent = true;
  macroRoot.add(grid);

  const flows = [];
  const nodeGroups = [];

  const points = {
    customers: new THREE.Vector3(-6.2, 0.45, 0),
    wiom: new THREE.Vector3(0, 0.55, 0),
    csp: new THREE.Vector3(6.2, 0.45, 0),
    assets: new THREE.Vector3(0, 0.45, -4.2),
    money: new THREE.Vector3(0, 0.45, 4.2),
    support: new THREE.Vector3(-4.7, 0.45, 3.35),
    quality: new THREE.Vector3(4.7, 0.45, -3.35)
  };

  addMacroNode('CUSTOMERS / DEMAND', points.customers, palette.green, 'houses');
  addMacroNode('CSP SUPPLY', points.csp, palette.blue, 'people');
  addMacroNode('NETBOX ASSETS', points.assets, palette.yellow, 'boxes');
  addMacroNode('RECHARGE + PAYMENT', points.money, palette.green, 'money');
  addMacroNode('SUPPORT', points.support, palette.red, 'support');
  addMacroNode('QUALITY + ENFORCEMENT', points.quality, palette.violet, 'quality');

  const hubBase = cylinder(1.55, 0.3, palette.teal, { x: 0, y: 0.14, z: 0 });
  const hubCore = box(2.55, 0.85, 1.55, palette.paper, { x: 0, y: 0.72, z: 0 });
  [hubBase, hubCore].forEach((part) => macroRoot.add(part));
  addMacroLabel(macroRoot, 'WIOM OS LAYER', 0, 1.42, 0, 'label label--station');

  [
    ['COMMIT', -1.55, -1.25, palette.teal],
    ['CL', -1.55, 1.25, palette.yellow],
    ['D&A', 1.55, -1.25, palette.green],
    ['PAY', 1.55, 1.25, palette.green],
    ['ASSET', 0, -1.85, palette.yellow],
    ['QUALITY', 0, 1.85, palette.violet]
  ].forEach(([label, x, z, colorValue]) => {
    const satellite = box(0.72, 0.24, 0.48, colorValue, { x, y: 0.28, z });
    macroRoot.add(satellite);
    addMacroLabel(macroRoot, label, x, 0.64, z, 'label label--caption');
  });

  addFlow(points.customers, points.wiom, palette.green, 0.16, 0, { z: -1.8, y: 2.1 });
  addFlow(points.wiom, points.csp, palette.teal, 0.14, 0.12, { z: -1.6, y: 2.4 });
  addFlow(points.assets, points.csp, palette.yellow, 0.12, 0.25, { x: 2.5, y: 2.2 });
  addFlow(points.csp, points.customers, palette.blue, 0.1, 0.4, { z: 1.8, y: 2.0 });
  addFlow(points.customers, points.money, palette.yellow, 0.13, 0.52, { x: -2.9, y: 2.6 });
  addFlow(points.money, points.csp, palette.green, 0.12, 0.66, { x: 3.2, y: 2.4 });
  addFlow(points.customers, points.support, palette.red, 0.1, 0.18, { x: -5.6, y: 1.7 });
  addFlow(points.support, points.quality, palette.violet, 0.09, 0.34, { y: 3.2 });
  addFlow(points.quality, points.wiom, palette.violet, 0.12, 0.78, { x: 2.5, y: 2.2 });
  addFlow(points.wiom, points.customers, palette.teal, 0.11, 0.9, { z: 1.7, y: 2.2 });

  function addMacroNode(label, position, colorValue, type) {
    const group = new THREE.Group();
    group.position.copy(position);

    const base = cylinder(0.72, 0.18, colorValue, { y: 0.08 });
    group.add(base);

    if (type === 'houses') {
      [-0.42, 0, 0.42].forEach((x, index) => {
        group.add(box(0.3, 0.42 + index * 0.05, 0.38, colorValue, { x, y: 0.42, z: 0 }));
        group.add(box(0.36, 0.08, 0.44, palette.white, { x, y: 0.68 + index * 0.05, z: 0, rotZ: 0.18 }));
      });
    } else if (type === 'boxes') {
      [-0.34, 0.04, 0.42].forEach((x, index) => {
        group.add(box(0.38, 0.38, 0.38, colorValue, { x, y: 0.38 + index * 0.1, z: index % 2 === 0 ? -0.1 : 0.18 }));
      });
    } else if (type === 'money') {
      group.add(cylinder(0.42, 0.16, colorValue, { y: 0.38 }));
      group.add(cylinder(0.42, 0.16, colorValue, { y: 0.58 }));
      group.add(cylinder(0.42, 0.16, colorValue, { y: 0.78 }));
    } else {
      group.add(box(0.95, 0.78, 0.7, colorValue, { y: 0.48 }));
      group.add(cylinder(0.24, 0.22, palette.white, { y: 1.0 }));
    }

    macroRoot.add(group);
    nodeGroups.push(group);
    addMacroLabel(macroRoot, label, position.x, 1.45, position.z, 'label label--station');
    return group;
  }

  function addFlow(start, end, colorValue, speed, offset, controlShift = {}) {
    const control = start.clone().lerp(end, 0.5);
    control.x += controlShift.x ?? 0;
    control.y += controlShift.y ?? 2;
    control.z += controlShift.z ?? 0;
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(72));
    const path = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: colorValue, transparent: true, opacity: 0.44 })
    );
    macroRoot.add(path);

    const token = sphere(0.13, colorValue);
    macroRoot.add(token);
    flows.push({ curve, token, speed, offset });
  }

  return {
    resize() {
      macroCamera.aspect = container.clientWidth / container.clientHeight;
      macroCamera.updateProjectionMatrix();
      macroRenderer.setSize(container.clientWidth, container.clientHeight);
      macroLabelRenderer.setSize(container.clientWidth, container.clientHeight);
    },
    tick(elapsed) {
      flows.forEach((flow, index) => {
        const progress = (elapsed * flow.speed + flow.offset) % 1;
        flow.curve.getPointAt(progress, flow.token.position);
        flow.token.scale.setScalar(1 + Math.sin(elapsed * 4 + index) * 0.18);
      });
      nodeGroups.forEach((group, index) => {
        group.position.y = Math.sin(elapsed * 1.5 + index) * 0.035;
      });
      macroRoot.rotation.y = elapsed * 0.16;
      macroRoot.rotation.x = Math.sin(elapsed * 0.18) * 0.04;
      hubCore.rotation.y = elapsed * 0.45;
      macroRenderer.render(macroScene, macroCamera);
      macroLabelRenderer.render(macroScene, macroCamera);
    }
  };
}

function checkpointInfo(code, name, question, plain) {
  return info(
    code,
    name,
    question,
    plain,
    'One checkpoint owns one decision before passing the car onward.',
    'Do not let another checkpoint quietly do this job.'
  );
}

function info(code, name, question, plain, controlsText, remember) {
  return {
    code,
    name,
    question,
    plain,
    controls: controlsText,
    remember,
    summary: plain
  };
}

function addLights() {
  threeScene.add(new THREE.AmbientLight(0xc5dcff, 1.3));

  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(8, 13, 10);
  threeScene.add(key);

  const rim = new THREE.PointLight(0x5fffe1, 11, 42);
  rim.position.set(-8, 5, -7);
  threeScene.add(rim);
}

function addBackdrop() {
  const starGeometry = new THREE.BufferGeometry();
  const count = 650;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 82;
    positions[i * 3 + 1] = (Math.random() - 0.1) * 34;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 82;
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  threeScene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x8db4ff, size: 0.028, transparent: true, opacity: 0.36 })
    )
  );
}

function addGround() {
  const grass = box(20, 0.05, 12, palette.grass, { x: 0, y: -0.06, z: 0 });
  grass.material.opacity = 0.55;
  grass.material.transparent = true;
  root.add(grass);

  const grid = new THREE.GridHelper(20, 20, 0x23445c, 0x102434);
  grid.position.y = -0.02;
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  root.add(grid);
}

function addRoad(length, width, z) {
  const road = box(length, 0.12, width, palette.asphalt, { x: 0, y: 0, z });
  root.add(road);

  for (let x = -length / 2 + 1.1; x < length / 2 - 0.7; x += 2.1) {
    root.add(box(1.05, 0.04, 0.08, palette.lane, { x, y: 0.09, z }));
  }

  root.add(box(length, 0.06, 0.08, '#ffffff', { x: 0, y: 0.1, z: z - width / 2 + 0.25 }));
  root.add(box(length, 0.06, 0.08, '#ffffff', { x: 0, y: 0.1, z: z + width / 2 - 0.25 }));
  return road;
}

function addGuardRail(z, colorValue, infoObject) {
  for (let x = -7; x <= 7; x += 1.4) {
    const post = box(0.12, 0.7, 0.12, colorValue, { x, y: 0.4, z });
    post.userData.info = infoObject;
    interactiveMeshes.push(post);
    root.add(post);
  }
  const rail = box(15, 0.12, 0.12, colorValue, { x: 0, y: 0.75, z });
  rail.userData.info = infoObject;
  interactiveMeshes.push(rail);
  root.add(rail);
}

function addRoadSign(label, x, z, colorValue, infoObject) {
  const pole = cylinder(0.06, 1.5, '#111111', { x, y: 0.75, z });
  const sign = box(1.45, 0.85, 0.12, colorValue, { x, y: 1.55, z });
  sign.userData.info = infoObject;
  pole.userData.info = infoObject;
  interactiveMeshes.push(sign, pole);
  root.add(pole, sign);
  addLabel(label, x, 1.58, z + 0.12, 'label label--sign');
  return sign;
}

function addCheckpoint(label, x, colorValue, infoObject, index) {
  const booth = box(1.35, 1.15, 1.35, colorValue, { x, y: 0.62, z: -2.85 });
  const barrier = box(1.95, 0.12, 0.12, colorValue, { x, y: 0.82, z: -1.1, rotZ: index % 2 === 0 ? -0.28 : 0.28 });
  booth.userData.info = infoObject;
  barrier.userData.info = infoObject;
  interactiveMeshes.push(booth, barrier);
  root.add(booth, barrier);
  addLabel(label, x, 1.45, -2.85, 'label label--station');
}

function createCar(infoObject, colorValue) {
  const group = new THREE.Group();
  const body = box(1.45, 0.42, 0.82, colorValue, { y: 0.22 });
  const roof = box(0.76, 0.36, 0.62, '#ffffff', { x: -0.1, y: 0.63 });
  const front = box(0.18, 0.24, 0.72, '#ffffff', { x: 0.82, y: 0.28 });
  [body, roof, front].forEach((mesh) => {
    mesh.userData.info = infoObject;
    interactiveMeshes.push(mesh);
    group.add(mesh);
  });

  [
    [-0.48, -0.48],
    [0.48, -0.48],
    [-0.48, 0.48],
    [0.48, 0.48]
  ].forEach(([x, z]) => {
    const wheel = cylinder(0.16, 0.16, '#111111', { x, y: 0.05, z });
    wheel.rotation.x = Math.PI / 2;
    wheel.userData.info = infoObject;
    interactiveMeshes.push(wheel);
    group.add(wheel);
  });

  return group;
}

function box(width, height, depth, colorValue, transform = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color: colorValue,
      emissive: new THREE.Color(colorValue).multiplyScalar(0.13),
      roughness: 0.34,
      metalness: 0.18,
      transparent: transform.opacity !== undefined,
      opacity: transform.opacity ?? 1
    })
  );
  mesh.position.set(transform.x ?? 0, transform.y ?? 0, transform.z ?? 0);
  mesh.rotation.set(transform.rotX ?? 0, transform.rotY ?? 0, transform.rotZ ?? 0);
  return mesh;
}

function cylinder(radius, height, colorValue, transform = {}) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 36),
    new THREE.MeshStandardMaterial({
      color: colorValue,
      emissive: new THREE.Color(colorValue).multiplyScalar(0.12),
      roughness: 0.36,
      metalness: 0.2
    })
  );
  mesh.position.set(transform.x ?? 0, transform.y ?? 0, transform.z ?? 0);
  mesh.rotation.set(transform.rotX ?? 0, transform.rotY ?? 0, transform.rotZ ?? 0);
  return mesh;
}

function sphere(radius, colorValue, transform = {}) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 16),
    new THREE.MeshStandardMaterial({
      color: colorValue,
      emissive: new THREE.Color(colorValue).multiplyScalar(0.22),
      roughness: 0.28,
      metalness: 0.18
    })
  );
  mesh.position.set(transform.x ?? 0, transform.y ?? 0, transform.z ?? 0);
  return mesh;
}

function line(start, end, colorValue, opacity) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: colorValue, transparent: true, opacity })
  );
}

function loopProgress(elapsed, speed) {
  return (elapsed * speed) % 1;
}

function addLabel(text, x, y, z, className) {
  const label = document.createElement('div');
  label.className = className;
  label.textContent = text;
  const labelObject = new CSS2DObject(label);
  labelObject.position.set(x, y, z);
  root.add(labelObject);
  return labelObject;
}

function addMacroLabel(parent, text, x, y, z, className) {
  const label = document.createElement('div');
  label.className = className;
  label.textContent = text;
  const labelObject = new CSS2DObject(label);
  labelObject.position.set(x, y, z);
  parent.add(labelObject);
  return labelObject;
}

function selectInfo(infoObject) {
  interactiveMeshes.forEach((mesh) => {
    const isSelected = mesh.userData.info === infoObject;
    mesh.scale.setScalar(isSelected ? 1.08 : 1);
  });
}

function clearRoot() {
  interactiveMeshes.length = 0;
  animated.length = 0;
  while (root.children.length > 0) {
    root.remove(root.children[0]);
  }
}

function onPointerMove(event) {
  const rect = stage.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  stage.classList.toggle('is-hovering-node', Boolean(intersect()));
}

function intersect() {
  raycaster.setFromCamera(pointer, camera);
  const [hit] = raycaster.intersectObjects(interactiveMeshes, false);
  return hit?.object ?? null;
}

function onResize() {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  labelRenderer.setSize(stage.clientWidth, stage.clientHeight);
  macroSystem?.resize();
  cockroachSystem?.resize();
}

function animate() {
  requestAnimationFrame(animate);
  const elapsed = performance.now() / 1000;
  animated.forEach((tick) => tick(elapsed));
  root.rotation.y = currentSceneId === 'car' ? Math.sin(elapsed * 0.18) * 0.025 : 0;
  controls.update();
  renderer.render(threeScene, camera);
  labelRenderer.render(threeScene, camera);
  macroSystem?.tick(elapsed);
  cockroachSystem?.tick(elapsed);
}
