# Design Handoff — roadmap-website-builder → huashu-design

Date: 2026-06-18 · Structural pass regenerated after the Mac/CPU/edge-first inference-engine revision.

## Frozen content contract

- Manifest: `Elenkhos/content-manifest.json`
- SHA-256: `1bd29dd2b5822e77af48a92d72c6efa63f6d113e06b389fd9b18fb23ae6fa693`
- Derived data files (regenerate only via the builder, never hand-edit):
  - `Elenkhos/manifest-data.js` (window.MANIFEST = manifest)
  - `Elenkhos/signals-data.js` (window.SIGNALS, derived from `data/keyword-analysis/priority-matrix.json` + roadmap evidence inventory)
  - `Elenkhos/syllabus-data.js` (legacy compatibility alias to `window.MANIFEST`; it contains no independent curriculum decisions)
- `Elenkhos/navigation/site-map.json` — canonical pages, including the detailed project specification page.

The design pass must not change the manifest, the data files, canonical IDs (`sig-*`, `unit-*`, `proj-*`, resource ids, `stage-*`), scores, statuses, priorities, project decisions, cut reasons, or resource assignments. If a design idea needs a content change, return it to roadmap-website-builder.

## Ownership boundaries

| File | Owner | Design pass may edit? |
|---|---|---|
| `Elenkhos/styles.css` | presentation | **Yes** — keep `:focus-visible` outlines, `@media (prefers-reduced-motion: reduce)`, and `.visually-hidden` |
| `Elenkhos/index.html`, `Elenkhos/pages/*.html` | structure | Markup structure/semantics no; may add classes, fonts (self-hosted/system only), meta theme-color |
| `Elenkhos/app.js` | structure + interaction semantics | Class names/ordering used for styling may be referenced; logic, ARIA, keyboard handlers, and rendered text **must not change**. Cosmetic-only additions (e.g. adding a class hook) allowed. |
| `Elenkhos/content-manifest.json`, `Elenkhos/*-data.js`, `Elenkhos/navigation/` | canonical | **No** |

## Required behavior to preserve

- Single collaboration view; the former learner/recruiter toggle has been removed so collaborators see the same proof, path, and roadmap content.
- All interactions reachable by keyboard: role map nodes (`tabindex=0`, Enter/Space), stage stepper buttons, dependency-board unit buttons, filter buttons with `aria-pressed`, `<details>` disclosures.
- No hover-only information anywhere.
- Every diagram keeps its adjacent accessible equivalent (tables/walkthroughs) — do not visually remove or `display:none` them.
- `aria-live` detail panels (role, stage, unit) keep announcing selection changes.
- Status/priority chips must stay distinguishable by **text label**, not color alone.
- No horizontal overflow at 375px; tables stay inside `.table-wrap`.
- Reduced-motion: any added animation must be disabled inside the existing media query.

## Visual direction requested (from user)

Restore the original warm-paper minimalist direction while retaining CS336 depth: quiet cream background, dark brown text, restrained rust accent, serif display headings, sans body copy, mono configs, narrow reading columns, wider experiment tables, visible commands/tests, and hairline structure. Project and Lessons dominate navigation; career evidence remains a secondary appendix. The current content contract is Mac/CPU/edge-first: Mac M4, laptop CPU, and Raspberry Pi 5 vs llama.cpp are primary; the CUDA/vLLM/SGLang leg is optional stretch. Avoid gradients, glassmorphism, card clutter, neon AI aesthetics, ornamental animation, oversized heroes, and generic portfolio styling.

## Validation commands (rerun after design)

```bash
node .agents/skills/roadmap-website-builder/scripts/validate_website.mjs --root .
```

Plus browser checks: desktop (1280px) + mobile (375px), keyboard tab-through, reduced-motion emulation, no console errors. Local server: `python3 -m http.server 4173 --directory Elenkhos`.

## Known issues / notes

- Site renders client-side from embedded data files; `file://` opening works (no fetch dependency), but the manifest link in the footer requires serving the `Elenkhos/` directory.
- The dependency board intentionally shows all four status columns even when a lane filter empties one.
