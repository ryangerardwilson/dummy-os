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

The main journey explains the whole OS structure:

- Car story: introduces the car, road, and driving manual.
- Road rules: shows primitives, guards, and parameters as laws, barriers, and speed limits.
- Checkpoints: shows each OS as a checkpoint that owns one decision.
- Wrong turn: shows why boundaries exist by blocking a shortcut.

The deep-dive scenes explain confusing terms:

- Primitives + guards: the Wiom road law plus the gate that blocks a private shortcut.
- Parameters: the number on a sign, such as speed limit 30 vs 60, where the rule stays the same but behavior changes.
- State machine: allowed stops and legal next moves.
- Events + logs: handoff slips and trip records.
- Authority boundary: one owner checkpoint, no shortcut ownership theft.
- Build spec: translation from OS doc to engineering instructions.

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
