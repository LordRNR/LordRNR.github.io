---
name: Junk to Luxury Simulator
tagline: Find a wreck. Restore it. Turn a tiny garage into a business.
summary: A Roblox simulation set in Villa Tuercas, with its own art direction, Candy Chrome. Players restore wrecked cars with physical tools, then sell them or keep them for a collection, and grow a workshop into a business. Server-authoritative Luau architecture, a data-driven restoration engine shared by every car, and a performance method based on measuring before building.
category: game
tech: [Luau, Roblox Studio, Rojo, Blender, Git]
status: in-development
period:
  start: 2026-10-28
featured: true
order: 1
links:
  repo: https://github.com/LordRNR/junk-to-luxury
media:
  hero: jtl-district-avenue
  gallery: [jtl-villa-aerial, jtl-ratchet-fitting, jtl-district-aerial, jtl-trueno-restored]
metrics:
  - label: lines of Luau, including tests
    short: lines of Luau · Junk to Luxury
    value: 46.9
    prefix: "≈"
    suffix: k
    decimals: 1
    asOf: 2026-11-16
    source: "Private repository, not published — find src -name '*.luau' | wc -l: 46,882 lines in 235 files (server 8.4k, client 9.3k, shared 7.8k, tests 12.8k, scene builders 8.5k)"
    basis: measured
    hero: true
  - label: modules in the Studio test folder
    value: 56
    asOf: 2026-11-16
    source: "Private repository, not published — ls src/tests: 56 modules, a few of them helper tools (Assist, Inspect); the tests are run inside Roblox Studio by Claude Code (results are as recorded in the project's reports, not re-run)"
    basis: measured
  - label: commits since the first on 2026-10-28
    value: 124
    asOf: 2026-11-16
    source: "Private repository, not published — git log --oneline: 124 commits up to 2026-11-15, on branch fase/05-distrito-mecanico"
    basis: measured
evidence:
  - claim: Staged restoration of three cars (clean, derust, sand/polish/paint, parts)
    detail: Automated test modules run in Studio by Claude Code. Real-player balance still to come
    state: tested
    kind: feature
    source: Private project notes, not published — docs/PROJECT_STATUS.md; Studio test modules Cometa62Work, Brisa68Work, Trueno55Work
    basis: documented
    verified: true
    highlight: true
  - claim: Tools, machines and the lift (wheel change)
    detail: Automated test modules run in Studio by Claude Code
    state: tested
    kind: feature
    source: Private project notes, not published — docs/BETA_PRIVADA.md §1 (Machines, Lift modules)
    basis: documented
    verified: true
  - claim: Jobs, ranks, economy and shop
    detail: Automated test modules run in Studio by Claude Code. The 30-minute fresh-start playtest is still pending
    state: tested
    kind: feature
    source: Private project notes, not published — docs/BETA_PRIVADA.md §1 (Economy, Progression, Paint modules)
    basis: documented
    verified: true
  - claim: Workshop expansion, second bay and two employees
    detail: Automated test modules run in Studio by Claude Code
    state: tested
    kind: feature
    source: Private project notes, not published — docs/BETA_PRIVADA.md §1 (Expansion, Lift, Workers, Mechanic modules)
    basis: documented
    verified: true
  - claim: Personal collection and a Car Show held on each server
    detail: Automated tests with bots, run in Studio by Claude Code. Several real clients still pending
    state: tested
    kind: feature
    source: Private project notes, not published — docs/BETA_PRIVADA.md §1 (Collection, CarShow modules)
    basis: documented
    verified: true
  - claim: Progress and in-progress cars are saved and restored
    detail: Automated tests with an in-memory store only
    state: tested
    kind: engineering
    source: Private project notes, not published — docs/GUARDADO.md; docs/BETA_PRIVADA.md §1
    basis: documented
    verified: true
    highlight: true
  - claim: Real DataStore persistence
    detail: Pending; there is no conclusive evidence yet. It needs a private beta copy
    state: pending
    kind: engineering
    source: Private project notes, not published — docs/BETA_PRIVADA.md §3
    basis: documented
    verified: true
    highlight: true
  - claim: Mechanic District, first playable loop (find, tune and fit a carburettor, start the engine, get paid)
    detail: Automated tests plus a keyboard play-through with captures, run in Studio by Claude Code. Hand testing by the owner is not claimed here
    state: tested
    kind: feature
    source: Private project notes, not published — docs/FASE_05_CICLO_CARBURADOR.md
    basis: documented
    verified: true
    highlight: true
  - claim: The district loop on a phone, with a real mouse and with two players
    state: pending
    kind: feature
    source: Private project notes, not published — docs/FASE_05_CICLO_CARBURADOR.md
    basis: documented
    verified: true
  - claim: Mobile performance
    detail: Not measured on a device; Studio cannot answer it
    state: pending
    kind: engineering
    source: Private project notes, not published — docs/FASE_05_BLOQUE0_RENDIMIENTO.md
    basis: documented
    verified: true
    highlight: true
  - claim: Original audio
    detail: Only free third-party sound effects from the Roblox Creator Store are used, as placeholders; they are not original work
    state: pending
    kind: feature
    source: Private repository, not published — the sound list (asset IDs not published); assets/audio is empty
    basis: measured
    verified: true
notes:
  - big: "52→32"
    title: Draw calls, not triangles.
    text: Profiling the avenue view showed that the eight workshops cost 52 draw calls but only about 24k triangles. Merging unions per material cut them to 32 (the whole view fell from 138 to 118), with a +3% change in triangles and an identical screenshot. A further cut was documented and deliberately not made, because nothing showed it was needed.
    source: Private project notes, not published — docs/FASE_05_BLOQUE3_CIERRE.md §2 (measured in Studio, Play mode)
    highlight: true
  - big: "×2"
    title: The cars cost more than the map.
    text: Before modelling the district, a measurement pass in Studio compared Villa Tuercas alone with a placeholder district. The placeholder's geometry added about +4.8% client instances, but each cloned car cost about 18,500 drawn triangles, so 16 cars doubled the triangle count of a view (248k → 545k). The recommendation was to keep a single Place, conditional on a real-phone test that is still pending. These are Studio measurements, not device measurements.
    source: Private project notes, not published — docs/FASE_05_BLOQUE0_RENDIMIENTO.md (marked MEASURED in Studio)
    highlight: true
  - big: "6 s"
    title: Saving inside the platform's limits.
    text: Roblox allows one write per key every six seconds, so saves are batched, with an autosave every 120 seconds. Cars are stored as records of about 320 bytes and rebuilt from approved templates. This is tested with an in-memory store only; real DataStore testing is pending.
    source: Private project notes, not published — docs/GUARDADO.md
  - big: "1 engine"
    title: One restoration engine, every car.
    text: The restoration logic is written once and each car only supplies data, through a vehicle registry used by the server, the client, the employees, saving and the tests. Adding a car means a Blender manifest plus data rows, and one test restores every variant of every model against its template.
    source: Private project notes, not published — docs/ARQUITECTURA.md ("Modelos de coche")
chapters:
  - key: world
    kicker: 01 / The world
    title: A town built around the workbench.
    text: Cars arrive wrecked. Players clean, derust, sand, polish, paint and repair them with physical tools, then sell them or keep them for a collection and a Car Show held on each server.
    media: jtl-villa-aerial
    tags:
      - { state: tested, label: "3 cars, automated" }
  - key: engine
    kicker: 02 / The engine
    title: One restoration engine, every car.
    text: The logic is written once and each car only supplies data. Adding a vehicle means a Blender manifest and a few rows, and one test restores every variant of every model against its template.
    media: jtl-ratchet-fitting
    tags:
      - { state: tested, label: Automated tests }
      - { state: pending, label: Real-player balance }
  - key: measure
    kicker: 03 / Measure first
    title: Measure before you build.
    text: Before modelling the new district, a placeholder was built and profiled in Studio. The geometry was cheap. The cars were not.
    media: jtl-district-aerial
    figures:
      - { value: "≈18.5k", label: triangles per cloned car, source: docs/FASE_05_BLOQUE0_RENDIMIENTO.md }
      - { value: "248k→545k", label: view triangles with 16 cars, source: docs/FASE_05_BLOQUE0_RENDIMIENTO.md }
      - { value: "−21%", label: parts loaded at stream radius 256, source: docs/FASE_05_BLOQUE0_RENDIMIENTO.md }
  - key: loop
    kicker: 04 / The loop
    title: First playable loop, honest ledger.
    text: Find the carburettor in a scrapyard, tune it on the bench, fit it, start the engine and get paid, with the server validating every step.
    media: jtl-trueno-restored
    tags:
      - { state: tested, label: Keyboard run, Claude Code }
      - { state: pending, label: Real DataStore }
      - { state: pending, label: Phone }
      - { state: pending, label: Two players }
architecture:
  - title: Server-authoritative
    text: The client only requests actions and renders state; the server validates and decides. Balance numbers live in frozen config tables, never in logic.
  - title: Small strict modules
    text: One responsibility per module, in Luau strict mode. Entry scripts only boot services.
  - title: Rojo manages code only
    text: Maps, models and UI are authored in Studio and are never overwritten by synchronisation.
  - title: Data-driven vehicles
    text: Restoration logic is shared; every car supplies data (panels, wear, damage, tool requirements) through a registry.
  - title: Versioned persistence
    text: A profile with a session lock, a load generation and sanitising on load, so older saves survive new fields.
contribution:
  human:
    - Product decisions, game mechanics and progression
    - Visual direction (Candy Chrome)
    - Evaluating the results
    - Supervising the AI-assisted work (no feature is credited to hand testing on this page until it is confirmed)
  assisted:
    - Luau implementation, Blender scripts, test modules, documentation and code review, written with Claude Code
    - Automated tests and play-throughs run in Roblox Studio by Claude Code, through a Studio bridge (MCP)
roadmap:
  - "Private-beta validation: real DataStore, phone and emulator, several clients and a 30-minute first session"
  - "The Mechanic District beyond its first loop: larger workshops, professional machinery and workers"
  - New vehicles, which need new 3D models
  - Original audio
privateNote: The game's source code, 3D models and place files are private.
caseStudy:
  enabled: true
  template: game
---

Junk to Luxury Simulator is a Roblox game in which the player starts with a small workshop and a pile of scrap. Cars arrive rusty and broken; the player restores them by hand with physical tools, then chooses between selling the car and keeping it for a personal collection that pays a bonus and can be shown in a Car Show held on each server. Money buys better tools, a bigger workshop, a second bay with a lift and employees. More zones are planned. The first, the Mechanic District, already has a first playable loop; it needs a district licence, earned at 50 sales.

## Art direction

The look is called Candy Chrome: saturated colour, thick rounded shapes and readable silhouettes, inspired by 1950s and 60s car culture. The interface uses paper, ink and stamps. The cars (Brisa 68, Trueno 55, Cometa 62) are generated by Python scripts in Blender and imported into Studio. The town and the district are assembled in-game by Luau builder scripts from simple parts.

## Honest status

The project is in development. It is playable in Roblox Studio, with automated test modules and a keyboard play-through of the first district loop, all run in Studio by Claude Code. It has not been validated on real devices or with real players. Its persistence has only been tested against an in-memory store, and real DataStore validation is pending. This page does not credit any feature to the owner's own hand testing until that is confirmed. Everything marked Pending is exactly that.

## Third-party content

The game uses free sound effects from the Roblox Creator Store (publishers such as Pro Sound Effects, plus community uploads) as placeholders. They are not original work, are not published here, and belong to their authors. The interface uses Roblox's built-in fonts. This page makes no claim about the provenance of the 3D models, textures or other assets beyond what is stated here. 