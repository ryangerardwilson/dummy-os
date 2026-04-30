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
    title: 'Traffic rules explain primitives and guards',
    summary: 'Some signs say what must always be true. Some barriers stop what must never happen.',
    lesson: 'In an OS doc, primitives are like road laws. Guards are like barriers and no-entry signs. They prevent the system from doing stupid things.',
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
  wrongTurn: {
    number: '04',
    title: 'Wrong turns explain boundaries',
    summary: 'A boundary is just a rule that says: do not take this shortcut; go through the right checkpoint.',
    lesson: 'If Support starts assigning partners directly, that is like a car jumping the lane divider. It may feel faster, but it breaks the road system.',
    camera: [0, 9.5, 16],
    target: [0, 0, 0]
  },
  termPrimitives: {
    number: 'T1',
    title: 'Primitives and guards',
    summary: 'A primitive is a road law. A guard is the barrier that physically prevents breaking that law.',
    lesson: 'Primitive = always true. Guard = block the illegal move. Put together, they keep the car from doing something that damages the business model.',
    camera: [0, 9, 16],
    target: [0, 0, 0]
  },
  termParameters: {
    number: 'T2',
    title: 'Parameters',
    summary: 'A parameter is a road setting like speed limit, allowed radius, retry count, or wait time.',
    lesson: 'Parameters are knobs. The rule stays the same, but the number can be tuned from a known place instead of hidden in code.',
    camera: [0, 8.5, 15],
    target: [0, 0, 0]
  },
  termState: {
    number: 'T3',
    title: 'State machine',
    summary: 'A state machine is the allowed order of road stops. The car cannot jump from start to finish randomly.',
    lesson: 'State tells you where the car is right now. Transitions tell you which next stops are legal.',
    camera: [0, 9.5, 17],
    target: [0, 0, 0]
  },
  termEvents: {
    number: 'T4',
    title: 'Events and logs',
    summary: 'An event is a handoff slip. A log is the trip record that proves the handoff happened.',
    lesson: 'Events let checkpoints talk without taking over each other’s job. Logs make the journey debuggable later.',
    camera: [0, 9, 16],
    target: [0, 0, 0]
  },
  termAuthority: {
    number: 'T5',
    title: 'Authority boundary',
    summary: 'Authority means one checkpoint owns the decision. Boundary means others cannot sneak around it.',
    lesson: 'If everyone can decide, nobody owns truth. Authority boundaries keep one official source for each decision.',
    camera: [0, 9.5, 16],
    target: [0, 0, 0]
  },
  termBuildSpec: {
    number: 'T6',
    title: 'Build spec',
    summary: 'A build spec turns the driving manual into construction instructions for engineers.',
    lesson: 'OS doc says what must be true. Build spec says how to build the road, signs, checkpoints, storage, and tests.',
    camera: [0, 8.7, 15],
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
  if (sceneId === 'wrongTurn') buildWrongTurnScene();
  if (sceneId === 'termPrimitives') buildPrimitiveGuardTermScene();
  if (sceneId === 'termParameters') buildParameterTermScene();
  if (sceneId === 'termState') buildStateTermScene();
  if (sceneId === 'termEvents') buildEventsTermScene();
  if (sceneId === 'termAuthority') buildAuthorityTermScene();
  if (sceneId === 'termBuildSpec') buildBuildSpecTermScene();

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
  const primitiveInfo = info(
    'LAW',
    'Road law',
    'What is a primitive?',
    'A primitive is a rule that should always stay true.',
    'Example: demand is system-led; partners do not privately own customers.',
    'In the car story, primitives are the traffic laws everyone must obey.'
  );
  const guardInfo = info(
    'GUARD',
    'No-entry guard',
    'What is a guard?',
    'A guard stops the car from entering a dangerous or forbidden path.',
    'Example: do not assign a customer to two partners at the same time.',
    'Guards are dumb by design: if the move is illegal, block it.'
  );
  const parameterInfo = info(
    'KNOB',
    'Speed limit',
    'What is a parameter?',
    'A parameter is a controlled knob, like a speed limit.',
    'Example: radius, wait time, cap, threshold, retry count.',
    'You can tune it, but it should live in a known place, not hidden in code.'
  );

  addGround();
  addRoad(15, 4.3, 0);
  addGuardRail(-2.5, palette.red, guardInfo);
  addGuardRail(2.5, palette.red, guardInfo);

  const car = createCar(info('CAR', 'Car under rules', 'Why rules?', 'The car can move only if it follows the road rules.', 'The OS document gives those rules names.', 'Without the rules, speed and shortcuts beat correctness.'), palette.teal);
  car.position.set(-4.8, 0.45, 0);
  root.add(car);

  addRoadSign('LAW: always true', -5.6, -3.2, palette.green, primitiveInfo);
  addRoadSign('SPEED LIMIT: parameter', -0.7, -3.2, palette.yellow, parameterInfo);
  addRoadSign('NO ENTRY: guard', 4.5, -3.2, palette.red, guardInfo);

  const blockedRoad = box(3.4, 0.12, 1.4, palette.red, { x: 4.8, y: 0.09, z: 3.15, rotY: -0.35 });
  blockedRoad.userData.info = guardInfo;
  interactiveMeshes.push(blockedRoad);
  root.add(blockedRoad);
  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-4.8, 2.8, loopProgress(elapsed, 0.16));
  });

  selectInfo(primitiveInfo);
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

function buildWrongTurnScene() {
  const laneInfo = info(
    'LANE',
    'Correct lane',
    'What is the boundary?',
    'The lane tells the car which checkpoint must make the decision.',
    'It controls ownership: coverage checks coverage, allocation assigns, support routes support.',
    'A boundary is understandable when you see the wrong turn being blocked.'
  );
  const shortcutInfo = info(
    'BLOCK',
    'Blocked shortcut',
    'What is the bad shortcut?',
    'A team tries to skip the owner checkpoint and make the decision directly.',
    'Example: Support directly assigning a partner instead of sending the car to Allocation.',
    'This may feel faster once, but it breaks trust in the road.'
  );
  addGround();
  addRoad(16, 4.3, 0);

  const sideRoad = box(7.2, 0.12, 1.25, palette.red, { x: 1.6, y: 0.08, z: 3.05, rotY: -0.45 });
  sideRoad.userData.info = shortcutInfo;
  interactiveMeshes.push(sideRoad);
  root.add(sideRoad);

  const barrier = box(0.28, 1.1, 3.4, palette.red, { x: -0.6, y: 0.62, z: 2.0, rotY: -0.45 });
  barrier.userData.info = shortcutInfo;
  interactiveMeshes.push(barrier);
  root.add(barrier);

  addCheckpoint('Allocation owns this', 0, palette.green, laneInfo, 0);
  addRoadSign('NO SHORTCUT', -0.8, 3.7, palette.red, shortcutInfo);

  const car = createCar(info('CAR', 'Car kept on route', 'What is happening?', 'The car is prevented from taking the wrong turn.', 'It must pass through the checkpoint that owns the decision.', 'That is the point of an OS boundary.'), palette.teal);
  car.position.set(-5.6, 0.45, 0);
  root.add(car);

  animated.push((elapsed) => {
    const phase = loopProgress(elapsed, 0.17);
    car.position.x = THREE.MathUtils.lerp(-5.6, 2.7, phase);
    car.position.z = phase > 0.55 ? Math.sin(elapsed * 4) * 0.04 : 0;
  });

  selectInfo(shortcutInfo);
}

function buildPrimitiveGuardTermScene() {
  const primitiveInfo = info(
    'LAW',
    'Primitive',
    'What is a primitive?',
    'A primitive is a law the road must always obey.',
    'Example: the system owns demand; no partner privately owns the customer.',
    'If the car is allowed to break this law, the whole road stops meaning anything.'
  );
  const guardInfo = info(
    'GUARD',
    'Guard',
    'What is a guard?',
    'A guard is the physical blocker that prevents law-breaking movement.',
    'Example: block double assignment, invalid state jump, or forbidden shortcut.',
    'A primitive says the rule. A guard enforces the rule.'
  );

  addGround();
  addRoad(15, 4.3, 0);
  addRoadSign('LAW', -5.4, -3.15, palette.green, primitiveInfo);
  addRoadSign('GUARD', 3.8, -3.15, palette.red, guardInfo);
  addGuardRail(2.55, palette.red, guardInfo);

  const badPath = box(4.2, 0.12, 1.05, palette.red, { x: 3.6, y: 0.08, z: 3.25, rotY: -0.28 });
  badPath.userData.info = guardInfo;
  interactiveMeshes.push(badPath);
  root.add(badPath);

  const car = createCar(info('CAR', 'Car obeying law', 'What is happening?', 'The car continues on the valid road because the guard blocks the bad road.', 'The OS doc describes both the law and the blocker.', 'This is why primitives and guards belong together.'), palette.teal);
  car.position.set(-6.2, 0.45, 0);
  root.add(car);

  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-6.2, 5.4, loopProgress(elapsed, 0.16));
  });

  selectInfo(primitiveInfo);
}

function buildParameterTermScene() {
  const parameterInfo = info(
    'PARAM',
    'Parameter',
    'What is a parameter?',
    'A parameter is a number you are allowed to tune without rewriting the rule.',
    'Examples: radius = 25m, retry count = 3, wait window = 10 minutes.',
    'Put knobs in one registry. Do not hide magic numbers inside random code.'
  );

  addGround();
  addRoad(15, 4.3, 0);
  addRoadSign('RADIUS 25m', -5.3, -3.15, palette.yellow, parameterInfo);
  addRoadSign('RETRY 3', 0, -3.15, palette.yellow, parameterInfo);
  addRoadSign('WAIT 10m', 5.3, -3.15, palette.yellow, parameterInfo);

  [-5.3, 0, 5.3].forEach((x, index) => {
    const knob = cylinder(0.52, 0.35, palette.yellow, { x, y: 0.28, z: 2.45 });
    knob.userData.info = parameterInfo;
    interactiveMeshes.push(knob);
    root.add(knob);
    animated.push((elapsed) => {
      knob.rotation.y = elapsed * (0.7 + index * 0.18);
    });
  });

  const car = createCar(info('CAR', 'Car under limits', 'What is happening?', 'The car still follows the same road, but the road settings affect allowed behavior.', 'Parameters tune the road without changing what the road means.', 'Same rule, governed knobs.'), palette.teal);
  car.position.set(-6.2, 0.45, 0);
  root.add(car);
  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-6.2, 5.8, loopProgress(elapsed, 0.14));
  });

  selectInfo(parameterInfo);
}

function buildStateTermScene() {
  const stateInfo = info(
    'STATE',
    'State',
    'What is state?',
    'State is the car’s current stop on the road.',
    'Examples: requested, checked, promised, assigned, active.',
    'If you know the state, you know what can legally happen next.'
  );
  const transitionInfo = info(
    'NEXT',
    'Transition',
    'What is a transition?',
    'A transition is an allowed move from one stop to the next.',
    'Example: requested can move to checked; checked can move to promised.',
    'A state machine prevents random jumps.'
  );

  addGround();
  addRoad(18, 4.3, 0);
  const stops = [
    ['Requested', -7.2],
    ['Checked', -3.6],
    ['Promised', 0],
    ['Assigned', 3.6],
    ['Active', 7.2]
  ];

  stops.forEach(([label, x], index) => {
    const stop = cylinder(0.68, 0.28, index === 0 ? palette.blue : palette.green, { x, y: 0.18, z: 0 });
    stop.userData.info = stateInfo;
    interactiveMeshes.push(stop);
    root.add(stop);
    addLabel(label, x, 0.75, 0, 'label label--station');
    if (index < stops.length - 1) {
      const segment = line(new THREE.Vector3(x + 0.8, 0.24, 0), new THREE.Vector3(stops[index + 1][1] - 0.8, 0.24, 0), palette.teal, 0.65);
      segment.userData.info = transitionInfo;
      root.add(segment);
    }
  });

  const shortcut = box(5.8, 0.1, 0.8, palette.red, { x: 0, y: 0.12, z: 3.1, rotY: -0.12 });
  shortcut.userData.info = transitionInfo;
  interactiveMeshes.push(shortcut);
  root.add(shortcut);
  addRoadSign('NO JUMP', 0, 3.75, palette.red, transitionInfo);

  const car = createCar(info('CAR', 'Stateful car', 'What is happening?', 'The car moves from stop to stop in a legal order.', 'Each stop is a state. Each road segment is a transition.', 'State machines are just legal journey maps.'), palette.teal);
  car.position.set(-7.2, 0.45, 0);
  root.add(car);
  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-7.2, 7.2, loopProgress(elapsed, 0.11));
  });

  selectInfo(stateInfo);
}

function buildEventsTermScene() {
  const eventInfo = info(
    'EVENT',
    'Event',
    'What is an event?',
    'An event is a handoff slip passed from one checkpoint to another.',
    'Example: Coverage says serviceable, then Allocation can use that fact.',
    'Events let checkpoints talk without stealing each other’s jobs.'
  );
  const logInfo = info(
    'LOG',
    'Event log',
    'What is a log?',
    'A log is the record that the handoff happened.',
    'It captures the event, owner, time, and useful context.',
    'Logs are how you debug the trip later.'
  );

  addGround();
  addRoad(14, 4.3, 0);
  addCheckpoint('Coverage', -4.7, palette.green, eventInfo, 0);
  addCheckpoint('Allocation', 4.7, palette.green, eventInfo, 1);

  const envelope = box(1.25, 0.42, 0.88, palette.paper, { x: -4.7, y: 0.58, z: 0 });
  envelope.userData.info = eventInfo;
  interactiveMeshes.push(envelope);
  root.add(envelope);
  addLabel('event slip', -4.7, 1.15, 0, 'label label--paper');

  const logbook = box(2.3, 0.36, 1.3, palette.violet, { x: 0, y: 0.25, z: 3.15, rotY: 0.1 });
  logbook.userData.info = logInfo;
  interactiveMeshes.push(logbook);
  root.add(logbook);
  addLabel('log', 0, 0.78, 3.15, 'label label--station');

  animated.push((elapsed) => {
    const phase = loopProgress(elapsed, 0.22);
    envelope.position.x = THREE.MathUtils.lerp(-4.7, 4.7, phase);
    envelope.position.y = 0.58 + Math.sin(elapsed * 7) * 0.025;
  });

  selectInfo(eventInfo);
}

function buildAuthorityTermScene() {
  const authorityInfo = info(
    'OWNER',
    'Authority',
    'What is authority?',
    'Authority means one checkpoint is the official owner of a decision.',
    'Example: Allocation owns who serves the customer.',
    'The owner checkpoint produces the truth others should consume.'
  );
  const boundaryInfo = info(
    'BOUND',
    'Boundary',
    'What is a boundary?',
    'A boundary says other checkpoints cannot make this decision by shortcut.',
    'Example: Support cannot directly assign a partner.',
    'Boundaries keep the road honest.'
  );

  addGround();
  addRoad(16, 4.3, 0);
  addCheckpoint('Authority: Allocation', 0, palette.green, authorityInfo, 0);
  addRoadSign('OWNER', 0, -3.3, palette.green, authorityInfo);

  const sideRoad = box(7.2, 0.12, 1.25, palette.red, { x: 1.6, y: 0.08, z: 3.05, rotY: -0.45 });
  const barrier = box(0.28, 1.1, 3.4, palette.red, { x: -0.6, y: 0.62, z: 2.0, rotY: -0.45 });
  [sideRoad, barrier].forEach((mesh) => {
    mesh.userData.info = boundaryInfo;
    interactiveMeshes.push(mesh);
    root.add(mesh);
  });
  addRoadSign('BOUNDARY', -0.8, 3.7, palette.red, boundaryInfo);

  const car = createCar(info('CAR', 'Car routed to owner', 'What is happening?', 'The car is forced through the checkpoint that owns the decision.', 'The bad shortcut exists visually, but the barrier blocks it.', 'Authority is useful only if the boundary is enforced.'), palette.teal);
  car.position.set(-5.6, 0.45, 0);
  root.add(car);
  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-5.6, 2.9, loopProgress(elapsed, 0.15));
  });

  selectInfo(authorityInfo);
}

function buildBuildSpecTermScene() {
  const osInfo = info(
    'OS',
    'OS doc',
    'What does the OS doc say?',
    'It says what must be true on the road.',
    'Ownership, rules, states, events, parameters, and forbidden moves.',
    'This is the policy manual.'
  );
  const specInfo = info(
    'SPEC',
    'Build spec',
    'What is a build spec?',
    'It turns the manual into construction instructions.',
    'Tables, endpoints, event handlers, state transitions, and tests.',
    'This is the bridge from policy to code.'
  );
  const codeInfo = info(
    'CODE',
    'Running service',
    'What does engineering build?',
    'The actual road, signs, barriers, and checkpoints the car uses.',
    'A service that follows the build spec and proves it with tests.',
    'Code should implement the manual, not invent its own road.'
  );

  addGround();
  const blocks = [
    ['OS doc', -5.4, palette.paper, osInfo],
    ['Build spec', 0, palette.yellow, specInfo],
    ['Code service', 5.4, palette.blue, codeInfo]
  ];

  blocks.forEach(([label, x, color, infoObject]) => {
    const block = box(3.2, 0.55, 2.15, color, { x, y: 0.32, z: 0 });
    block.userData.info = infoObject;
    interactiveMeshes.push(block);
    root.add(block);
    addLabel(label, x, 0.92, 0, 'label label--station');
  });

  root.add(line(new THREE.Vector3(-3.55, 0.45, 0), new THREE.Vector3(-1.85, 0.45, 0), palette.teal, 0.65));
  root.add(line(new THREE.Vector3(1.85, 0.45, 0), new THREE.Vector3(3.55, 0.45, 0), palette.teal, 0.65));

  const car = createCar(info('CAR', 'Idea becomes road', 'What is moving?', 'The idea moves from policy to spec to code.', 'Each step makes the instruction more buildable.', 'A build spec is not extra paperwork; it is translation.'), palette.teal);
  car.position.set(-6.8, 0.9, 2.7);
  root.add(car);
  animated.push((elapsed) => {
    car.position.x = THREE.MathUtils.lerp(-6.8, 6.8, loopProgress(elapsed, 0.12));
  });

  selectInfo(specInfo);
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

  root.add(box(length, 0.06, 0.08, '#d7edf3', { x: 0, y: 0.1, z: z - width / 2 + 0.25 }));
  root.add(box(length, 0.06, 0.08, '#d7edf3', { x: 0, y: 0.1, z: z + width / 2 - 0.25 }));
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
  const pole = cylinder(0.06, 1.5, '#d7edf3', { x, y: 0.75, z });
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
  const roof = box(0.76, 0.36, 0.62, '#b8f5ff', { x: -0.1, y: 0.63 });
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
    const wheel = cylinder(0.16, 0.16, '#111820', { x, y: 0.05, z });
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
