# NetEngineerLab Engineering Rules Platform Architecture

## Purpose

NetEngineerLab evolves from a calculator collection into a deterministic engineering platform:

```text
Calculate → Configure → Validate → Diagnose
```

The shared foundation is the **Engineering Rules Engine**. It automates repeatable checks; it does not replace an engineer or prove that a configuration is safe merely because no rule fired.

## Principles and pipeline

1. Calculation engines produce facts. Rules evaluate facts. Presentation explains results.
2. Deterministic parsers and rules decide `finding`, `severity`, `evidence`, `ruleId` and score impact.
3. AI may translate, summarize and organize troubleshooting steps, but must not create, suppress or change findings, Evidence or severity.
4. Pasted configuration and command output are untrusted. Never execute them or rule expressions with `eval`, `Function`, shell commands or dynamic imports.
5. Every finding identifies its rule and shows Evidence derived from normalized input.
6. Existing calculators remain supported; formulas migrate only after independent parity verification.

```text
Parameters / configuration / command output
  → limits and normalization
  → explicit vendor/protocol parser
  → vendor-neutral intermediate representation (IR)
  → deterministic rule evaluation
  → findings and dimension score
  → evidence-backed recommendations
  → optional AI explanation
  → browser/report output
```

Vendor detection may suggest a value, but users can confirm or override it. Ambiguous syntax produces a parser warning rather than a silent guess.

## Component boundaries

```text
website/data/engineering-rules/
  rule-schema.json
  severity-policy.json
  acl/rules.json
  acl/vendor-capabilities.json

website/assets/js/rules-engine/
  normalize.js
  evaluate.js
  score.js
  evidence.js
  report.js

website/assets/generated/rules-engine/
  rules-bundle.<sha256-12>.js

website/tools/acl-generator-validator/
  index.html
  zh/index.html
  manifest.webmanifest
  sw.js
  js/engine.js
  js/ir-adapter.js
  js/parsers/cisco-ios.js
  js/parsers/huawei-vrp.js
  js/parsers/h3c-comware.js
  js/parsers/juniper-junos.js
  js/generators/cisco-ios.js
  js/generators/huawei-vrp.js
  js/generators/h3c-comware.js
  js/generators/juniper-junos.js
  js/app.js
  js/pwa.js
  docs/engine-test.js
```

Shared code owns validation, evaluation, scoring, Evidence formatting and report structure. Tool `engine.js` is the DOM-free deterministic entry point that composes its Parser, IR adapter, Generator and shared evaluator and runs in Node.js tests. `app.js` only binds the UI to `engine.js`; `pwa.js`, `manifest.webmanifest` and `sw.js` retain the standard offline responsibilities required of every tool.

Vendor parsers, generators and the domain IR adapter are Tool 21 source modules under the paths above. Vendor syntax must not be accumulated inside `engine.js` or the shared evaluator.

`website/assets/js/rules-engine/` is shared source code. Every referenced rules-engine asset uses a build-generated content-hash URL, enters every active tool Service Worker shared cache, and participates in build, architecture validation, offline tests and release acceptance. Content changes update references and cache versions through the build pipeline rather than manual page edits.

Nested files under `website/data/engineering-rules/` are authoritative source data, not runtime URLs. The build validates and packages the applicable rules, severity policy and vendor capabilities into `website/assets/generated/rules-engine/rules-bundle.<sha256-12>.js`, where the suffix is the first 12 lowercase hexadecimal characters of the bundle content SHA-256. This file is generated, never edited manually and never treated as a configuration source. The bundle enters the same required Service Worker caches and release consistency checks as the evaluator. Build validation rejects incompatible evaluator, rule-schema, scoring-policy or bundle versions so an old rule set cannot run with a new evaluator.

## Intermediate representation and rules

Parsers return structured data, warnings and source locations—not findings. Unsupported syntax belongs in `unparsed` and is never treated as validated.

Every production rule requires:

- stable ID such as `ACL-001`, schema version and rule version;
- domain, category and affected score dimensions;
- exactly one severity: `CRITICAL`, `HIGH`, `MEDIUM` or `INFO`;
- registered condition operator and declarative parameters;
- bilingual title, finding, reason, recommendation and field-experience note;
- applicable vendors and source types;
- Evidence selector/formatter and authoritative references;
- positive, negative and boundary fixtures.

Rule data calls operators from a reviewed registry. JSON rules never contain executable JavaScript. `LOW` is not permitted; parser confidence is separate from severity.

## Evidence, scoring and privacy

A finding without Evidence is invalid. Evidence contains only the minimum necessary source fragment and must be escaped before rendering. Secrets, community strings and keys are masked. Analytics never captures pasted configuration, command output, addresses or findings. CSV export mitigates spreadsheet formula injection.

V1 processes configuration and explanations entirely in the local browser and sends no input or finding data to AI services. Any future AI integration requires a separate reviewed consent design and may receive only minimal, redacted deterministic results; raw configurations, command output, addresses, Evidence and secrets are not transmitted.

The Engineering Score is a screening aid, not proof of availability, security or compliance. Dimensions are Connectivity, Security, Reliability, Manageability and Best Practice.

- `CRITICAL` applies the versioned maximum score defined by the scoring policy.
- Repeated findings from one root cause are de-duplicated or capped.
- `INFO` does not reduce the score by default.
- Scoring is versioned, reproducible and traceable to rules.
- Before calibration, the policy threshold is `null` and the UI displays no score `PASS/FAIL`. A future versioned policy defines both threshold and severity caps together before enabling such a label.

## Tool 21: Multi-Vendor ACL Generator & Validator

V1 scope:

- parameter generation and pasted-configuration validation;
- explicit Cisco IOS, Huawei VRP, H3C Comware and Juniper Junos modes;
- vendor-neutral ACL IR with source-line Evidence;
- 10–15 high-confidence rules before expansion toward 20;
- Generate, Validate, Explain and Risk Check flows;
- deterministic bilingual findings, category scores and severity summary;
- visible parser coverage and unsupported-syntax warnings;
- local browser processing with no AI dependency.

V1 excludes multi-device topology correlation, automatic remediation, history, PDF export, accounts and paid-plan enforcement.

## Existing-tool migration

1. Keep each verified calculation engine unchanged.
2. Inventory deterministic status thresholds and recommendations.
3. Express those judgments as versioned rules.
4. Compare legacy and rules-engine results with golden fixtures.
5. Switch UI output only after independent parity verification.

Optical tools are the first migration candidates because they already produce receiver power, sensitivity, margin, wavelength and compatibility facts.

## Required gates

- schema validation, duplicate-ID detection and registered-operator validation;
- rejection of executable rule content;
- fixtures for every claimed vendor/source type;
- four-vendor Generator golden fixtures, syntax validation and `Generate → Parse → IR` semantic-equivalence tests;
- deterministic rule-bundle output and filename/content-hash verification;
- rejection of direct browser references to source rule JSON;
- failure fixtures for evaluator/schema/policy/bundle version incompatibility;
- identical bundle hash in page references, Service Worker caches and Release Manifest;
- positive, negative, malformed-input and exact-boundary rule tests;
- Evidence line, escaping and secret-masking tests;
- stable scoring, de-duplication and severity-cap tests;
- English/Chinese parity;
- desktop/mobile browser tests with large and malicious input;
- `npm run verify` integration;
- independent 2号验证官 `PASS` before push.

## Delivery sequence

1. Architecture and rule contract.
2. JSON Schema, severity policy and operator registry.
3. Shared evaluator, Evidence formatter and scorer.
4. ACL normalized model and one vendor parser.
5. All four claimed vendor parsers/generators.
6. Ten to fifteen reviewed ACL rules.
7. Bilingual Tool 21 UI and browser acceptance.
8. Expansion only after production acceptance.
