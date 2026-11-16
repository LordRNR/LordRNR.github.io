---
name: xauscalp
tagline: Is there a net statistical edge in short-term gold trading? A research system built to answer honestly.
summary: A research and engineering project on XAUUSD scalping, built around preregistered studies, a fail-closed risk manager, Python and MQL5 parity checks and repeated audits. Its conclusion is that no strategy met the preregistered criteria, so there is no statistically validated trading edge. It is not a profitable bot, a financial product or financial advice.
category: research
tech: [Python, MQL5, pandas, NumPy, pytest, uv, ruff, MetaTrader 5]
status: archived
statusNote: Research concluded
period:
  start: 2026-11-12
  end: 2026-11-15
featured: true
order: 2
links:
  repo: https://github.com/LordRNR/xauscalp-research
metrics:
  - label: automated tests passing in the public repository
    short: automated tests passing · xauscalp
    value: 636
    asOf: 2026-11-16
    source: "pytest in a fresh install of the public repository: 636 passed, 0 skipped, 24 files, no market data or network (run 2026-11-16). The private development repository has 727: 62 test the configuration of the AI tool and 30 the order-sending component, neither published, and the public repository adds one regression test"
    basis: measured
    hero: true
  - label: day-sessions with matching Python and MQL5 signals
    short: Python–MQL5 parity sessions
    value: 90
    asOf: 2026-11-14
    source: reports/parity/README.md — 88 SIGNAL and 2 NO_BREAKOUT, 0 hard differences
    basis: documented
    hero: true
  - label: preregistered strategy configurations
    short: preregistered configurations
    value: 22
    asOf: 2026-11-15
    source: reports/08_alt_strategies.md — 22 configurations in 4 families
    basis: documented
    hero: true
  - label: orders sent in the recorded dry run (historical result)
    short: orders sent in the recorded dry run
    value: 0
    asOf: 2026-11-15
    source: docs/decisiones.md ADR 37 — a dry run of the order-sending component, which is not published; 88 signals and 52 order checks, 0 orders sent
    basis: documented
evidence:
  - claim: Python and MQL5 compute the same signals
    detail: 90 day-sessions, 0 hard differences. This is calculation equivalence, not profitability
    state: tested
    kind: engineering
    source: reports/parity/README.md
    basis: documented
    verified: true
    highlight: true
  - claim: Preregistered studies of an opening-range breakout and four more strategy families
    detail: No statistically validated trading edge
    state: tested
    kind: feature
    source: reports/07_orb_broker_eval.md; reports/08_alt_strategies.md
    basis: documented
    verified: true
    highlight: true
  - claim: The risk manager rejects anything it cannot verify (fail-closed)
    state: tested
    kind: engineering
    source: docs/auditoria_2026-11-12.md (R1); tests/test_risk.py; tests/test_risk_invalid_inputs.py
    basis: documented
    verified: true
    highlight: true
  - claim: Execution engine, dry run (documented historical result; component not published)
    detail: 88 signals, 52 order checks, 0 orders sent. Recorded in the development repository; it cannot be reproduced from the public one
    state: tested
    kind: engineering
    source: docs/decisiones.md ADR 37
    basis: documented
    verified: true
    highlight: true
  - claim: Multi-asset research code
    detail: Unit-tested on synthetic data; never run on real data
    state: implemented
    kind: feature
    source: docs/decisiones.md ADR 44
    basis: documented
    verified: true
  - claim: Order execution on a demo account
    detail: Not pursued, because no edge was found
    state: pending
    kind: feature
    source: docs/02_plan_fases.md
    basis: documented
    verified: true
notes:
  - big: "NaN → approved"
    title: A risk manager that failed open.
    text: The first audit found the risk manager approving trades when the spread, the data age or the free margin was NaN. It now rejects anything it cannot verify, with regression tests.
    source: docs/auditoria_2026-11-12.md (R1, critical)
    highlight: true
  - big: "≈110 bars"
    title: Same window, different clock.
    text: Python and the Expert Advisor disagreed on two Monday sessions. A window defined as 502 bars was measured in wall-clock time, so Monday mornings after the weekend gap held only about 110 bars. The parity test caught it, and the final result is equivalence on 90 sessions.
    source: docs/decisiones.md ADR 29; reports/parity/README.md
    highlight: true
  - big: "8.5–15%"
    title: A strategy with no edge still passes the simulated challenge.
    text: At 0.5% risk, strategies without a demonstrated edge passed the simulated two-step challenge between 8.5% and 15.0% of the time in the null control (8.5% for the opening-range breakout, 9.0% for Donchian, 9.8% for pullback and 15.0% for momentum). A pass rate means nothing without that control, so the study was rebuilt around it.
    source: reports/09_propfirm_feasibility.md; docs/decisiones.md ADR 43
  - big: "Locked"
    title: Holdout leakage, found and closed.
    text: An audit found a data loader decoding files from the locked holdout period before trimming them. Readers now stop at the research boundary, and a static test enforces it.
    source: docs/auditoria_2026-11-12.md (H1, H1b); docs/decisiones.md ADR 16 and 25
architecture:
  - title: Python researches, MQL5 runs the same rules
    text: The MetaTrader5 Python package ships only Windows wheels and the research machine is a Mac, so research stays in Python and the MetaTrader side is an Expert Advisor inside MetaTrader 5, with no inter-process link. The public repository publishes the read-only Expert Advisor used for the parity check; the one that could send orders is not published.
  - title: Rules exist twice, so parity is mandatory
    text: The strategy logic lives in both languages. A parity check compares their signals session by session on the same data.
  - title: Strategies propose, the risk manager decides
    text: A signal is a proposal with no authority. A fail-closed risk manager and a hard-limit module sit between every proposal and any order.
  - title: Reproducible by construction
    text: A locked uv environment, one script per study, reports regenerated from code, and studies declared not validable when data coverage is insufficient.
contribution:
  human:
    - Set the research question and the risk constraints
    - Supervised the work and reviewed the results
    - Decided what could be claimed from them
  assisted:
    - Implementation, test suite, independent read-only audits and their regression fixes, and report drafts, all produced with Claude Code, which also ran the tests and the audits
    - No hand-written code and no personally run test or audit is claimed
caseStudy:
  enabled: true
  template: research
---

xauscalp asks one question: is there a net statistical edge in short-term gold (XAUUSD) trading? The project is built to answer it honestly rather than to sell a result. The project's documents set out hypotheses, parameters, cost scenarios and the verdict rule as fixed before each study ran.

## About the public repository

The public repository is a clean snapshot with a new Git history. The original development history is kept private, so the public commit history is not evidence of the order in which things were done: the protocols, decisions and reports in `docs/` and `reports/` document what was planned, decided and found. It leaves out the internal configuration of the AI assistant, the market data and the CSV files derived from it. It also leaves out the one component that could send orders (an Expert Advisor and its engine), with the tests and dry-run evidence that belong to it, so that nothing in the public repository can place an order. It has 132 files and 636 automated tests: the private development repository has 727, of which 62 check the AI-tool configuration and 30 the order-sending component, none published, and the public repository adds one regression test for a downloader fix.

## Conclusion

No strategy met the preregistered criteria. There is no statistically validated trading edge. That is a negative result, defended with the evidence below, and it is not a claim that no profitable strategy can exist.

## What this is not

It is not a profitable trading bot, a validated financial product or financial advice. Live trading is disabled in code. The component that could send orders is not published; its only recorded use was a dry run that sent no orders, a historical result that the public repository cannot reproduce.
