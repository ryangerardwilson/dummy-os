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
  termPrimitives: {
    number: 'T1',
    title: 'Primitives and guards',
    summary: 'Primitive = the law: stay on the Wiom road. Guard = the gate that blocks a private shortcut.',
    lesson: 'A primitive describes what must always be true. A guard is the code/check/barrier that refuses a move when the car tries to break that truth.',
    camera: [0, 9, 16],
    target: [0, 0, 0]
  },
  termParameters: {
    number: 'T2',
    title: 'Parameters',
    summary: 'A parameter is the number on the sign. Same road, same rule, different value.',
    lesson: 'The rule is “obey the speed limit.” The parameter is the number on the sign. Change 30 to 60, and the car can move faster without rebuilding the road.',
    camera: [0, 8.5, 15],
    target: [0, 0, 0]
  },
  termState: {
    number: 'T3',
    title: 'State machine',
    summary: 'A state machine is like a car wash: Queue → Soap → Rinse → Dry → Done.',
    lesson: 'State = which bay the car is currently in. Transition = the conveyor moving it to the next allowed bay.',
    camera: [0, 9.5, 17],
    target: [0, 0, 0]
  },
  termSubsystem: {
    number: 'T4',
    title: 'Roadwork tiers',
    summary: 'Think of tiers as roadwork permits. Tier 1 repaints a sign. Tier 2 adds a local detour. Tier 3 rebuilds the junction and needs rollback controls.',
    lesson: 'The bigger the blast radius, the stricter the permit. Tier 3 is not a different kind of subsystem; it is the control level for risky system change.',
    camera: [0, 11.5, 19],
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
const sceneSummary = document.querySelector('#sceneSummary');
const sceneLesson = document.querySelector('#sceneLesson');
const selectedKicker = document.querySelector('#selectedKicker');
const selectedCode = document.querySelector('#selectedCode');
const selectedQuestion = document.querySelector('#selectedQuestion');
const selectedName = document.querySelector('#selectedName');
const selectedSummary = document.querySelector('#selectedSummary');
const selectedPlain = document.querySelector('#selectedPlain');
const selectedControls = document.querySelector('#selectedControls');
const selectedRemember = document.querySelector('#selectedRemember');
const sceneButtons = document.querySelectorAll('.view-button');

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

addLights();
addBackdrop();
setScene('car');

sceneButtons.forEach((button) => {
  button.addEventListener('click', () => setScene(button.dataset.scene));
});

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
  sceneLesson.textContent = config.lesson;

  if (sceneId === 'car') buildCarScene();
  if (sceneId === 'rules') buildRulesScene();
  if (sceneId === 'checkpoints') buildCheckpointScene();
  if (sceneId === 'termPrimitives') buildPrimitiveGuardTermScene();
  if (sceneId === 'termParameters') buildParameterTermScene();
  if (sceneId === 'termState') buildStateTermScene();
  if (sceneId === 'termSubsystem') buildSubsystemTermScene();

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

function buildPrimitiveGuardTermScene() {
  const primitiveInfo = info(
    'LAW',
    'Primitive',
    'What is a primitive?',
    'A primitive is the road law that must always remain true.',
    'Example: the customer must stay on the Wiom-owned road; no partner gets a private customer road.',
    'The primitive tells everyone what the system must protect.'
  );
  const guardInfo = info(
    'GUARD',
    'Guard',
    'What is a guard?',
    'A guard is the gate that blocks a car when it tries to break the road law.',
    'Example: reject private assignment, double assignment, invalid state jump, or forbidden shortcut.',
    'Primitive says the rule. Guard refuses the illegal move.'
  );
  const violationInfo = info(
    'BAD',
    'Private shortcut attempt',
    'What is being blocked?',
    'The red car is trying to leave the Wiom road and enter a private shortcut.',
    'That is the kind of move a guard should reject.',
    'If the guard does not block this, the primitive is just a poster on the wall.'
  );

  addGround();
  addRoad(15, 4.3, 0);
  addRoadSign('LAW: stay on Wiom road', -5.6, -3.15, palette.green, primitiveInfo);

  const privateRoad = box(7.6, 0.12, 1.05, palette.red, { x: 1.7, y: 0.08, z: 3.05, rotY: -0.42 });
  privateRoad.userData.info = violationInfo;
  interactiveMeshes.push(privateRoad);
  root.add(privateRoad);

  const gate = box(0.34, 1.25, 3.1, palette.red, { x: -0.85, y: 0.68, z: 2.05, rotY: -0.42 });
  gate.userData.info = guardInfo;
  interactiveMeshes.push(gate);
  root.add(gate);

  addRoadSign('GUARD blocks shortcut', -1.05, 3.6, palette.red, guardInfo);
  addRoadSign('PRIVATE ROAD', 3.8, 4.3, palette.red, violationInfo);

  const goodCar = createCar(info('CAR', 'Valid customer car', 'What is happening?', 'This car stays on the official Wiom road.', 'It follows the primitive, so the guard does not need to stop it.', 'The happy path is boring because the law is being followed.'), palette.teal);
  goodCar.position.set(-6.2, 0.45, 0);
  root.add(goodCar);

  const badCar = createCar(violationInfo, palette.red);
  badCar.position.set(-3.1, 0.45, 1.5);
  badCar.rotation.y = -0.42;
  root.add(badCar);

  animated.push((elapsed) => {
    const goodPhase = loopProgress(elapsed, 0.13);
    goodCar.position.x = THREE.MathUtils.lerp(-6.2, 5.4, goodPhase);

    const badPhase = Math.min(loopProgress(elapsed, 0.2) * 1.35, 1);
    badCar.position.x = THREE.MathUtils.lerp(-3.1, -1.05, badPhase);
    badCar.position.z = THREE.MathUtils.lerp(1.5, 2.45, badPhase);
  });

  selectInfo(primitiveInfo);
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

function buildSubsystemTermScene() {
  const subsystemInfo = info(
    'SUB',
    'Subsystem worksite',
    'What is a subsystem?',
    'A subsystem is a specialist worksite attached to the Wiom road.',
    'It performs one bounded job, like checking whether Wiom should promise service.',
    'It can help the road, but it does not own every checkpoint or the whole journey.'
  );
  const tier1Info = info(
    'T1',
    'Tier 1: repaint the sign',
    'What is Tier 1?',
    'Tier 1 is a small polish job. The car drives the same road in the same way.',
    'Example: copy change, spacing fix, known bug fix, or refactor with identical behavior.',
    'If the route, rules, money, states, and trust do not change, this is Tier 1.'
  );
  const tier2Info = info(
    'T2',
    'Tier 2: local detour',
    'What is Tier 2?',
    'Tier 2 changes one local stretch of road, but the wider road system stays the same.',
    'Example: new validation, new screen in an existing flow, notification, or backend call inside an existing contract.',
    'The car may bend around a cone, but it does not enter a new highway system.'
  );
  const tier3Info = info(
    'T3',
    'Tier 3: rebuild the junction',
    'What is Tier 3?',
    'Tier 3 changes the junction: rules, states, money, routing, trust, or failure modes.',
    'Example: promise decision logic, state machine, entitlement, assignment, payout, irreversible action, or policy change.',
    'This needs a full permit, rollback road, observability, and kill switch because many cars can be affected.'
  );

  addGround();
  addRoad(17.5, 1.55, -3.35);
  addRoad(17.5, 1.55, 0);
  addRoad(17.5, 1.55, 3.35);

  const worksite = box(2.2, 0.22, 1.28, palette.paper, { x: -7.0, y: 0.18, z: 0 });
  worksite.userData.info = subsystemInfo;
  interactiveMeshes.push(worksite);
  root.add(worksite);
  addLabel('subsystem worksite', -7.0, 0.58, 0, 'label label--station');

  addRoadSign('T1: repaint sign', -4.85, -4.75, palette.green, tier1Info);
  addRoadSign('COPY FIX', 0.2, -4.75, palette.paper, tier1Info);
  const paintTray = box(1.0, 0.08, 0.52, palette.teal, { x: 1.55, y: 0.16, z: -4.1 });
  const paintRoller = box(0.95, 0.08, 0.12, palette.teal, { x: 2.45, y: 0.28, z: -4.1, rotZ: 0.24 });
  [paintTray, paintRoller].forEach((part) => {
    part.userData.info = tier1Info;
    interactiveMeshes.push(part);
    root.add(part);
  });

  addRoadSign('T2: local detour', -4.85, -1.4, palette.violet, tier2Info);
  const detourPatch = box(2.0, 0.16, 1.1, palette.red, { x: -0.3, y: 0.14, z: 0 });
  detourPatch.userData.info = tier2Info;
  interactiveMeshes.push(detourPatch);
  root.add(detourPatch);
  addLabel('one blocked patch', -0.3, 0.72, 0, 'label label--station');
  [-1.35, -0.65, 0.05, 0.75].forEach((x) => {
    const cone = cylinder(0.12, 0.42, palette.teal, { x, y: 0.34, z: -0.9 });
    cone.userData.info = tier2Info;
    interactiveMeshes.push(cone);
    root.add(cone);
  });

  addRoadSign('T3: rebuild junction', -4.85, 1.95, palette.teal, tier3Info);
  const junction = box(3.35, 0.16, 2.55, palette.paper, { x: -0.2, y: 0.14, z: 3.35 });
  const gate = box(0.16, 1.2, 2.2, palette.red, { x: -1.8, y: 0.7, z: 3.35 });
  const controlTower = box(1.0, 1.65, 1.0, palette.teal, { x: 1.95, y: 0.9, z: 4.75 });
  [junction, gate, controlTower].forEach((part) => {
    part.userData.info = tier3Info;
    interactiveMeshes.push(part);
    root.add(part);
  });
  addLabel('new rules + states', -0.2, 0.72, 3.35, 'label label--station');
  addLabel('control room', 1.95, 1.88, 4.75, 'label label--station');

  const rollbackRoad = box(5.0, 0.1, 0.82, palette.asphalt, { x: 2.75, y: 0.07, z: 5.75, rotY: -0.28 });
  rollbackRoad.userData.info = tier3Info;
  interactiveMeshes.push(rollbackRoad);
  root.add(rollbackRoad);
  addLabel('rollback road', 3.35, 0.45, 5.7, 'label label--station');

  const killSwitch = box(0.82, 0.3, 0.82, palette.red, { x: 3.35, y: 1.95, z: 4.75 });
  killSwitch.userData.info = tier3Info;
  interactiveMeshes.push(killSwitch);
  root.add(killSwitch);
  addLabel('kill switch', 3.35, 2.36, 4.75, 'label label--station');

  const tier1Car = createCar(info('CAR', 'Tier 1 car', 'What is happening?', 'The car drives straight through because only the sign was repainted.', 'No new behavior. No new state. No new contract.', 'Tier 1 is safe polish.'), palette.teal);
  tier1Car.position.set(-7.4, 0.45, -3.35);
  root.add(tier1Car);

  const tier2Car = createCar(info('CAR', 'Tier 2 car', 'What is happening?', 'The car bends around one local work patch, then returns to the same road.', 'Behavior changed locally, but the whole road system did not change.', 'Tier 2 is a local detour, not a junction rebuild.'), palette.blue);
  tier2Car.position.set(-7.4, 0.45, 0);
  root.add(tier2Car);

  const tier3Car = createCar(info('CAR', 'Tier 3 car', 'What is happening?', 'The car reaches a rebuilt junction where the system rules can change.', 'This needs a permit, rollback road, monitoring, and a kill switch.', 'Commitment Decision Spec lands here because promise mistakes can affect many downstream cars.'), palette.teal);
  tier3Car.position.set(-7.4, 0.45, 3.35);
  root.add(tier3Car);

  const waitingCar = createCar(tier3Info, palette.blue);
  waitingCar.position.set(-2.8, 0.45, 3.85);
  waitingCar.scale.setScalar(0.86);
  root.add(waitingCar);

  animated.push((elapsed) => {
    const phase = loopProgress(elapsed, 0.1);
    tier1Car.position.x = THREE.MathUtils.lerp(-7.4, 7.2, phase);
    tier1Car.position.y = 0.45 + Math.sin(elapsed * 5) * 0.02;

    const tier2Phase = loopProgress(elapsed + 1.3, 0.1);
    tier2Car.position.x = THREE.MathUtils.lerp(-7.4, 7.2, tier2Phase);
    if (tier2Car.position.x > -2.6 && tier2Car.position.x < 2.6) {
      const detourProgress = (tier2Car.position.x + 2.6) / 5.2;
      tier2Car.position.z = Math.sin(detourProgress * Math.PI) * 1.05;
    } else {
      tier2Car.position.z = 0;
    }
    tier2Car.position.y = 0.45 + Math.sin(elapsed * 5) * 0.02;

    const tier3Phase = loopProgress(elapsed + 2.4, 0.075);
    tier3Car.position.x = THREE.MathUtils.lerp(-7.4, 6.9, tier3Phase);
    tier3Car.position.z = tier3Phase > 0.63 ? THREE.MathUtils.lerp(3.35, 5.1, Math.min((tier3Phase - 0.63) / 0.24, 1)) : 3.35;
    tier3Car.position.y = 0.45 + Math.sin(elapsed * 5) * 0.02;
    gate.rotation.z = Math.sin(elapsed * 1.4) * 0.18;
    controlTower.rotation.y = Math.sin(elapsed * 0.7) * 0.08;
  });

  selectInfo(tier3Info);
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

function selectInfo(infoObject) {
  selectedKicker.textContent = 'Story object';
  selectedCode.textContent = infoObject.code;
  selectedQuestion.textContent = infoObject.question;
  selectedName.textContent = infoObject.name;
  selectedSummary.textContent = infoObject.summary;
  selectedPlain.textContent = infoObject.plain;
  selectedControls.textContent = infoObject.controls;
  selectedRemember.textContent = infoObject.remember;

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
}

function animate() {
  requestAnimationFrame(animate);
  const elapsed = performance.now() / 1000;
  animated.forEach((tick) => tick(elapsed));
  root.rotation.y = currentSceneId === 'car' ? Math.sin(elapsed * 0.18) * 0.025 : 0;
  controls.update();
  renderer.render(threeScene, camera);
  labelRenderer.render(threeScene, camera);
}
