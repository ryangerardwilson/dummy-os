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
- Subsystem = a specialist machine inside Wiom that does bounded work.
- Tiers = governance levels for changes/specs, not separate species of subsystems or prestige levels.
- Tier 1 = low-risk polish with no behavior change.
- Tier 2 = local behavior change inside existing boundaries.
- Tier 3 = system-level risk: new rules, states, money, routing, trust, or failure modes.

## Scenes

The main journey explains the whole OS structure:

- Car story: introduces the car, road, and driving manual.
- Road rules: shows primitives, guards, and parameters as laws, barriers, and speed limits.
- Checkpoints: shows each OS as a checkpoint that owns one decision.
- Wrong turn: shows why boundaries exist by blocking a shortcut.

The deep-dive scenes explain confusing terms:

- Primitives + guards: the Wiom road law plus the gate that blocks a private shortcut.
- Parameters: the number on a sign, such as speed limit 30 vs 60, where the rule stays the same but behavior changes.
- State machine: a car wash conveyor where the car moves Queue → Soap → Rinse → Dry → Done.
- Subsystem tiers: a bounded machine plugged into the road, plus the Tier 1 / Tier 2 / Tier 3 governance ladder used to govern changes/specs.

The text sections then stitch the metaphor back to Satyam's actual OS map:

- Commitment Decision Spec (formerly Genie): bounded subsystem / decision spec governed at Tier 3 because promise decisions can affect trust, routing, lifecycle handoff, and failure modes. Not an OS. "Tier 3 subsystem" means it needs Tier 3 governance, not that it is a third type of subsystem.
- CL OS: what state is the connection in?
- D&A OS: who should serve the connection?
- Capacity & Coverage OS: where can Wiom serve, who is eligible, and how much capacity exists?
- Asset Custody Lifecycle OS: the OS authority for device custody truth.
- Asset Custody Service / ACS: the service implementation of the Asset Custody OS.
- Quality, Enforcement, Exit, Compensation, Payment, Support, and CAEO: the adjacent authorities that own execution truth, posture, closure, money, complaint truth, and customer access truth.

Visual system follows Wiom brand basics: Noto Sans, Wiom Pink `#E5178F`,
black, white, and neutral gray.

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
