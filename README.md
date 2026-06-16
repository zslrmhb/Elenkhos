# Elenkhos

Elenkhos is a static collaboration site for the summer AI systems capstone:

- `elenkhos-train`: data curation, tokenizer, model tests, 70M lab pretraining, evaluation, Qwen3-1.7B SFT, and DPO.
- `elenkhos-serve`: export, quantization, C++ serving, scheduler, reliability, canary, rollback, and release qualification.

The website is the project map. GitHub Issues are the work queue.

## Start Here

- Website entry point: [`index.html`](index.html)
- Project specification: [`pages/projects.html`](pages/projects.html)
- Lessons and implementation gates: [`pages/lessons.html`](pages/lessons.html)
- 12-week roadmap: [`pages/roadmap.html`](pages/roadmap.html)
- Short collaboration brief: [`brief.pdf`](brief.pdf)
- Markdown version of the brief: [`brief.md`](brief.md)

## Collaboration Rules

Every issue or PR should name:

- the lesson or roadmap stage it belongs to;
- the artifact it changes;
- the command or test that verifies it;
- the measured result or reason it is blocked.

Do not add new project scope without cutting equivalent work. Do not use paid cloud compute before the Mac promotion gate passes. Do not claim an improvement without a frozen baseline and a reproducible command.

## GitHub Pages

This repo is a static site at the repository root.

Enable GitHub Pages in repo settings:

`Settings -> Pages -> Source: Deploy from a branch -> Branch: main -> Folder: /root`

Expected URL:

`https://zslrmhb.github.io/Elenkhos/`
