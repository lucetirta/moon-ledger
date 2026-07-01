# Moon Ledger Known Pitfalls

## Purpose
This document captures recurring engineering pitfalls discovered during development. It should remain concise and evolve only when a lesson is likely to repeat.

## Current Pitfalls
- Global CSS can unexpectedly break local layouts.
- The Dashboard is a summary layer and should never become the source of truth.
- Subscription automation should suggest values, never overwrite user intent.
- Prefer one reusable component over duplicated renderers when the user experience should be identical.
- Fix the responsible layer instead of patching another layer.
- When visible UI contradicts source code, trust runtime inspection over assumption.

## Usage Guidance
- Read this document when debugging regressions that feel misleading or cross-layer.
- Add new pitfalls only when they represent reusable engineering lessons, not one-off incidents.