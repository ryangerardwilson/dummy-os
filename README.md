# dummy-os

Three.js visual translator for explaining Wiom OS documents to non-technical
users through a numbered micro-to-macro story.

The central metaphor:

- Customer request = car.
- Business journey = road.
- OS document = driving manual for one part of the road.
- Road laws = truths that must always hold.
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

The page is organized into five sections:

- 1. Wiom OS for 5 year olds: explains one customer request as a car moving through the road.
- 2. What SD has created?: stitches the car metaphor back to the OS document structure.
- 3. Wiom OS for a Rocket Scientist: animates the wider Wiom system of demand, supply, assets, money, quality, support, and access.
- 4. Read the map from authority to artifact: explains the taxonomy order.
- 5. The real OS authorities people are confused by: maps the actual OS authorities.

The main micro journey explains the single-customer flow:

- Car story: introduces the car, road, and driving manual.
- Road rules: shows laws, boundaries, and guards as traffic laws, owner lanes, and blocked shortcuts.
- Checkpoints: shows each OS as a checkpoint that owns one decision.

The remaining deep-dive scenes explain confusing terms:

- Parameters: the number on a sign, such as speed limit 30 vs 60, where the rule stays the same but behavior changes.
- State machine: a car wash conveyor where the car moves Queue → Soap → Rinse → Dry → Done.

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
