# dummy-os: Wiom OS Context

This markdown file mirrors the dummy-os website as closely as possible so AI agents can ingest the same Wiom OS explanation that humans see visually.

## 1. Wiom OS Basic Concepts

Start with one customer request. The car shows how a single demand unit moves through promise, rules, checkpoints, assignment, and lifecycle without teams inventing shortcuts.

### 1. Wiom OS

Start with a car on a road.

The customer request is the car. The business journey is the road. The OS document is the driving manual.

Do not start with architecture words. Start with this: a car should move safely from start to finish without everyone inventing their own traffic rules.

Key objects:

- CAR: The car is one customer request trying to move through Wiom. It carries simple facts: location, phone number, selected plan, current status. If the car moves without road rules, every team can pull it in a different direction.
- ROAD: The road is the customer journey from request to connected customer. The road controls the order in which decisions happen. The OS map is trying to stop chaos on this road.
- MANUAL: The OS document is the driving manual for one part of the road. It says who decides, what rules apply, what gets recorded, and what is forbidden. OS document means rulebook for the journey, not computer operating system.

### 2. Laws, boundaries & guards

Traffic rules explain laws, boundaries, and guards.

Road laws say what must stay true. Boundaries say which lane owns the decision. Guards block illegal shortcuts.

In an OS doc, laws define the truth, boundaries assign ownership, and guards stop the car when someone tries to bypass the owner.

Key objects:

- LAW: The law is the truth that must always stay true. Example: demand is system-led; partners do not privately own customers. In the car story, this is the traffic law every car must obey.
- LANE: A boundary says which lane or checkpoint owns the decision. Example: Allocation chooses the partner; Support should not secretly assign one. Boundaries stop teams from taking shortcuts into each other's jobs.
- GUARD: A guard is the barrier that blocks the car when it tries to break the law or boundary. Example: do not assign a customer to two partners at the same time. Guards are dumb by design: if the move is illegal, block it.

### 3. Checkpoints

Checkpoints explain OS ownership.

Each checkpoint has one job. Coverage checks the area. Allocation picks the driver. Lifecycle tracks the trip.

An OS is like a checkpoint with one responsibility. It should make its own decision and then pass the car to the next checkpoint.

Key checkpoints:

- Coverage checkpoint: Can this area be served? This checkpoint checks whether the car is on a road Wiom can actually serve.
- Promise checkpoint: Can we promise service? This checkpoint records a promise only after serviceability is clear.
- Assignment checkpoint: Who should serve the customer? This checkpoint chooses the partner. Other checkpoints should not secretly do this.
- Journey checkpoint: Where is the customer now? This checkpoint updates the official customer journey state.
- Help checkpoint: Who fixes a problem? This checkpoint routes issues to the right owner.

### 4. Parameters

A parameter is the number on the sign. Same road, same rule, different value.

The rule is "obey the speed limit." The parameter is the number on the sign. Change 30 to 60, and the car can move faster without rebuilding the road.

Key objects:

- PARAM: A parameter is a setting value, like the number on a speed-limit sign. The rule is still the same: obey the sign. Only the number changes. Keep these numbers in one known place, not hidden inside random code.
- Speed limit 30: The same road has a stricter speed setting. The car still follows the same rule, but it moves slower. Changing the parameter changes behavior without changing the rule.
- Speed limit 60: The same road has a looser speed setting. The car still follows the same rule, but it can move faster. Same road. Same rule. Different parameter value.

### 5. State machine

A state machine is like a car wash: Queue -> Soap -> Rinse -> Dry -> Done.

State = which bay the car is currently in. Transition = the conveyor moving it to the next allowed bay.

Key objects:

- STATE: State is the car-wash bay the car is currently inside. Examples: Queue, Soap, Rinse, Dry, Done. If the car is in Soap, it is not also in Dry. One current state at a time.
- NEXT: A transition is the conveyor moving the car from one bay to the next allowed bay. Example: Soap can move to Rinse. Rinse can move to Dry. Transitions are the legal moves.

## 2. If you only need to remember 3 things ...

Satyam has mapped a business operating model, not a computer OS. It is a driving manual for how one customer request should move through Wiom without teams inventing their own shortcuts.

1. The customer request is the car. The business journey is the road. The OS document explains how that car is supposed to move from start to finish.
2. Each OS is a checkpoint with one owned truth. Subsystems are specialist machines that help those checkpoints; they are not allowed to become secret OSes.
3. The rule layer keeps the car safe: tiers classify risk, laws, boundaries, and guards block bad jumps, parameters tune behavior, and the state machine defines the next allowed move.

## 3. The Wiom OS Universe

Now zoom out from one car. Wiom is a live marketplace loop: customers create demand, CSPs provide supply, NetBoxes carry access, money settles incentives, and support plus quality signals keep the system honest.

Demand, supply, assets, money, quality, support, and access move around one governed Wiom operating layer.

System notes:

- Demand: Customers create demand. Commitment decides whether Wiom should promise.
- Supply: CSPs provide capacity. D&A and Capacity decide who can serve.
- Assets: NetBoxes are scarce working capital. Asset Custody tracks where they are.
- Money + Trust: Recharges fund the loop. Compensation, Payment, Quality, Support, and Enforcement keep it stable.

## 4. Read the map from authority to artifact

Most confusion comes from mixing levels. An OS, a subsystem, a tier, a spec, a service, and a signal are not interchangeable names. The tier is the governance weight of the change, not a new authority.

Reading order:

1. Wiom system: The full road network: customers, CSPs, devices, money, service quality, support, and access all moving together.
2. OS authorities: The official checkpoints. Each OS owns one durable truth and its lifecycle. Example: CL owns connection state; Asset Custody owns device custody.
3. Subsystems: Specialist machines inside Wiom. They do bounded work, read declared signals, and emit controlled outputs. They are not allowed to become secret OSes.
4. Decision specs and contracts: A spec is the written rule for how something should work. A decision spec says how one decision is made. An interface contract says how two authorities exchange inputs and outputs.
5. Tier ladder for specs: Once a spec changes, L1, L2, or L3 tells you how risky that change is. L1 is low-risk polish. L2 is a local behavior change. L3 is system-level risk: new states, rules, money, routing, trust, or failure modes.
6. Services, signals, parameters: The implementation pieces: code that runs, events that move between authorities, and tunable values like thresholds, caps, and time windows.

## 5. Dissecting an OS like a cockroach

An OS is not any big feature. An OS is the official owner of one durable business truth. If it only calculates, routes, displays, stores, or implements something, it is probably not an OS.

Simple test:

- Does it own truth and lifecycle? If yes, it may be an OS. If no, it is more likely a spec, service, parameter, contract, renderer, or subsystem.
- OS = official truth owner + legal states + allowed moves + clear handoffs.

The page shows this as a cockroach anatomy specimen: the head is owned truth, the body is the state machine, the legs are inputs and outputs, the shell is invariants, and the base plate is the audit trail.

Essential attributes of a Wiom OS:

- Owned truth: The one fact this OS is responsible for. Example: connection state, device custody, payout entitlement.
- Object: The thing being governed: customer connection, CSP, NetBox, complaint, wallet, or access entitlement.
- States: The official buckets the object can be in. One current state at a time, with names other OSes can reference.
- Transitions: The legal moves between states. The OS must say what can move, when, and why.
- Guards: The blockers that stop illegal moves. If a move breaks the rule, the guard blocks it.
- Levers: The authorized actions the OS can take. If the lever is not listed, the OS cannot improvise it.
- Inputs: The signals this OS is allowed to read from other OSes. Hidden dependencies are not allowed.
- Outputs: The events or truth this OS sends downstream when something changes.
- Invariants: The never-break rules. Example: one NetBox cannot be officially held by two CSPs at once.
- Non-goals: The boundaries: what this OS explicitly does not own, so it does not become a secret mega-OS.
- Parameters: The tunable numbers: thresholds, caps, retry limits, windows, and timeouts.
- Audit trail: The evidence needed to explain why a state changed or why a decision happened.

## 6. The real OS authorities people are confused by

"Checkpoint" is only our car-story translation. Satyam's real structure is a set of Operating Systems: each one owns exactly one kind of truth, and the customer journey moves by passing signals between them.

OS authorities:

- CL OS, Connection Lifecycle: Owns the connection object: what state it is in, what events can move it, and which lifecycle signal goes downstream. It does not decide who serves. It emits the connection event; D&A consumes it.
- D&A OS, Demand & Allocation: Owns the "who serves?" decision. It chooses the CSP for a new assignment, retry, reassignment, slot change, or structural reroute. It does not define connection state, zones, payouts, quality, or payments. It consumes those truths from other OSes.
- CC OS, Capacity & Coverage: Owns supply topology: zones, boundaries, CSP-zone eligibility, capacity caps, effective coverage, and redundancy pressure. D&A needs this before routing, because allocation is only as good as the supply map it reads.
- Quality OS: Owns execution truth: whether service stability, service resolution, installation quality, and complaint experience are healthy or degraded. It does not punish or allocate. It produces truth that Enforcement, D&A, and Compensation act on.
- ENF OS, Enforcement: Owns CSP eligibility posture. It turns sustained Quality truth or integrity events into CLEAR, WATCH, RESTRICTED, PRE_EXIT, or suspension-style consequences. It does not compute quality, money, or routing. It emits posture signals that others consume.
- Exit OS: Owns the controlled closure of a CSP relationship. It manages the exit state machine and tells downstream OSes what must happen next. It does not do routing math or payments. It triggers D&A, Payments, Custody, Capacity, and CL to perform their owned work.
- Asset Custody OS, Asset Custody Lifecycle: Owns Wiom-owned device custody truth: which CSP holds which NetBox, whether it is deployed, idle, returned, damaged, lost, or written off. It observes and emits custody facts. It does not punish, pay, or route.
- COMP OS, Compensation: Owns economic entitlement: what a CSP has earned from valid recharge events, quality eligibility, and enforcement posture. It calculates money. It does not move money. Payment OS does that.
- PAY OS, Payment & Settlement: Owns wallet mutation, settlement, withdrawal, ledger reconciliation, freezes, holds, and liability adjustment. Its rule is simple: it moves money, but it does not decide money.
- SR OS, Support & Resolution: Owns service complaint intake, classification, task routing, timer governance, closure, and the resolution signal sent to Quality. It turns messy customer problems into clean service-truth signals.
- CAEO OS, Customer Access Entitlement OS: Owns the customer-facing answer: can this active connection use internet right now? It resolves customer recharge entitlement plus CL supply state into ENABLED or BLOCKED access truth.

If someone is confused, ask which OS owns the truth:

- What state is the connection in? CL OS.
- Who should serve it? D&A OS.
- Where can we serve and at what capacity? Capacity & Coverage OS.
- Is the CSP executing well? Quality OS.
- Should posture change? Enforcement OS.
- Is the CSP exiting? Exit OS.
- Who owns device custody truth? Asset Custody OS.
- What has the CSP earned? Compensation OS.
- Who moves the money? Payment OS.
- What should the customer app show? CAEO OS.

## 7. Non-OS Components

These are still important, but they do not own lifecycle truth. They support OS authorities, implement them, or define controlled decisions and handoffs.

Non-OS components:

- Commitment Decision Spec (formerly Genie): Answers one bounded question: should Wiom promise service here? It can affect trust, routing, lifecycle handoff, and failure modes, so changes need Tier 3 governance. It is not an OS.
- Asset Custody Service / ACS: Implements pieces of the Asset Custody OS in software. The OS owns custody truth. The service executes part of that authority; it is not a separate OS.
- Specs and contracts: A spec is the written rule for how something should work. A contract says how two authorities exchange inputs and outputs. Specs and contracts govern behavior, but they do not own lifecycle truth by themselves.
- Services, signals, parameters: Services are code that runs. Signals are events that move. Parameters are tunable values like thresholds, caps, and time windows. They are useful parts of the machine, but they are not OS authorities.
