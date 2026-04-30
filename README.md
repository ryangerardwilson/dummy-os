# dummy-os

Three.js visual translator for explaining Wiom OS documents to non-technical
users through a car-on-road story.

The central metaphor:

- Customer request = car.
- Business journey = road.
- OS document = driving manual for one part of the road.
- Primitives = traffic laws.
- Guards = no-entry signs and guardrails.
- Parameters = speed limits and tunable road rules.
- OS ownership = checkpoints with one job.
- Boundaries = lane rules that block wrong turns and shortcuts.

## Scenes

- Car story: introduces the car, road, and driving manual.
- Road rules: shows primitives, guards, and parameters as laws, barriers, and speed limits.
- Checkpoints: shows each OS as a checkpoint that owns one decision.
- Wrong turn: shows why boundaries exist by blocking a shortcut.

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL printed in the terminal.

## Build

```bash
npm run build
```
