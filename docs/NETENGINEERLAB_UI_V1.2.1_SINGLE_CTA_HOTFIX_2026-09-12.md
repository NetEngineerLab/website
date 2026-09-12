# NetEngineerLab UI V1.2.1 Single CTA Hotfix

Date: 2026-09-12

## Problem
Some Tool Detail pages could display a second "Start calculating / 开始计算" button at the upper-left of the viewport while the canonical CTA was already present in the shared header.

## Root cause
`tool-shell-v1.9.9-04.js` retained a legacy runtime fallback that could append `.start-btn` when the shared header CTA was not detected at that exact initialization moment. With the V1.2 shared header, runtime CTA creation is no longer valid.

## Fix
- Shared Header is now the only source of the calculator context CTA.
- Runtime no longer creates `.start-btn`.
- Runtime removes stray legacy `.start-btn` nodes.
- `site-shell.css` contains a migration guard that hides legacy start buttons.
- `audit:ui-v1.2` requires exactly one `.site-shell-context-action` container and rejects static `.start-btn` markup.

## Standard
Tool Detail pages must expose at most one top-level calculator CTA, located in `.site-shell-actions > .site-shell-context-action`.
