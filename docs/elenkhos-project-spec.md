---
title: Elenkhos Summer 2026 Project Specification
aliases:
  - Elenkhos
  - Elenkhos-1.7B
  - ElenkhosServe
tags:
  - ai-systems
  - llm-training
  - reasoning
  - inference
  - cs336
status: active
deadline: 2026-09-11
---

# Elenkhos Summer 2026 Project Specification

> [!abstract] One-line project
> **Elenkhos** is a small-model reasoning and release-reliability project:
> distill a visible Socratic policy into `Qwen3-1.7B`, evaluate it with
> `ElenkhosBench`, and qualify its quantized releases through the C++20
> `ElenkhosServe` control plane.

This is the implementation specification for:

- [[summer-2026-two-project-plan]]
- [[elenkhos-architecture-decision]]
- [[elenkhos-starter-kit]]
- `data/roadmap/roadmap.yaml`
- `website/content-manifest.json`

The specification borrows the assignment-contract style of Stanford CS336:
every part names the problem, starter interface, exact data, implementation,
experiments, tests, deliverables, and completion gate. It does not copy CS336
solutions.

## 1. Naming Contract

Use one family name across artifacts.

| Artifact | Name | Meaning |
|---|---|---|
| umbrella project | **Elenkhos** | transliteration of the Socratic method of examination and refutation |
| product model after SFT | `Elenkhos-1.7B-SFT` | structured questioning and argument-analysis policy |
| product model after DPO | `Elenkhos-1.7B-DPO` | preference-tuned release candidate |
| from-scratch systems model | `Elenkhos-70M-Lab` | CS336-style implementation and profiling artifact, not the product model |
| evaluation suite | `ElenkhosBench` | hidden-premise, reconstruction, dialectic, fallacy, and systems-regression tests |
| C++ serving system | `ElenkhosServe` | runtime adapter, scheduler, admission control, qualification, canary, and rollback |
| training repository | `elenkhos-train` | Python/PyTorch data, model, training, post-training, and evaluation |
| serving repository | `elenkhos-serve` | C++20 service plus Python workload and evaluation clients |

Do not return to `Philosopher AI`, `MiniLM Forge`, or `ForgeGate` in new
artifacts. Those names are either generic or fail to connect the model and
runtime as one release system.

## 2. Core Decision

> [!decision] Use a distilled model
> The product model should be distilled. Use the post-trained
> [`Qwen/Qwen3-1.7B`](https://huggingface.co/Qwen/Qwen3-1.7B) as the student,
> not `Qwen3-1.7B-Base`.

Why:

1. The project contribution is a measurable reasoning *policy*, not rebuilding
   generic instruction following.
2. The post-trained student already supports thinking and non-thinking modes.
3. A base model would require a broad instruction-tuning stage before the
   Socratic experiment becomes interpretable.
4. The from-scratch `Elenkhos-70M-Lab` already proves ownership of tokenizer,
   architecture, optimizer, checkpointing, data, and profiling.

Run a 200-item pilot across approved Qwen3 teacher candidates before generating
the full staged dataset (2K/4K/8K). Select the cheapest candidate that clears
the frozen quality, acceptance-rate, latency, and projected-total-cost gates;
do not default to the largest model regardless of evidence.
[`Qwen/Qwen3-14B-AWQ`](https://huggingface.co/Qwen/Qwen3-14B-AWQ) on 24GB and
[`Qwen/Qwen3-32B-AWQ`](https://huggingface.co/Qwen/Qwen3-32B-AWQ) on 48GB are
pilot candidates, not a fixed primary/fallback ordering. The teacher is not
ground truth: every retained example must pass a deterministic verifier, a
human rubric, or an explicitly disclosed judge. Record teacher ID, revision,
prompt version, decoding parameters, acceptance rate, cost per accepted
example, and latency. Do not imply that the teacher Pod is the same Pod used
for the 24GB SFT run.

### 2.1 Assignment Overview

This capstone is one chronological system with two independently reviewable
packages:

- `elenkhos-train`: data, tokenizer, model primitives, pretraining,
  evaluation, verified distillation, SFT, and DPO;
- `elenkhos-serve`: export, quantization, C++ inference integration,
  scheduling, reliability, and release qualification.

#### What You Will Implement

1. A versioned data pipeline that acquires source data through bounded
   streaming, materializes immutable snapshots, removes duplicates and
   contamination, and emits separate pretraining, SFT, preference, evaluation,
   and retrieval artifacts.
2. A byte-level BPE tokenizer with a fixed `16,384`-token production
   vocabulary and round-trip, determinism, and throughput tests.
3. A tested decoder-only Transformer stack and model ladder from primitive
   tests through `Elenkhos-70M-Lab`.
4. A Mac pre-scaling harness proving data, tokenizer, forward/backward,
   optimizer, checkpoint, resume, and evaluation correctness before paid runs.
5. A cloud systems harness covering forward/backward/optimizer timing,
   profiling, mixed precision, activation checkpointing, and memory accounting.
6. An A3-style scaling study and final `71,205,760`-parameter pretraining run.
7. A frozen evaluation contract comparing the 70M laboratory checkpoint with
   the Qwen serving baseline and post-trained checkpoints while disclosing the
   unequal pretrained priors.
8. Verified synthetic-data generation, Qwen3-1.7B QLoRA SFT, and DPO.
9. Reproducible GGUF export plus Q8/Q4 qualification through `llama.cpp`.
10. A C++ OpenAI-compatible adapter, scheduler, admission controller, metrics,
    release qualification, rollback policy, and cross-layer report.

#### Problem Index and Required Deliverables

| ID | Subproblem | Required deliverable |
| --- | --- | --- |
| D0 | Data contract | Source registry, schemas, licenses, hashes, split policy, and immutable dataset manifest |
| D1 | Acquisition and curation | Streaming materializer, filters, deduplication, contamination report, and token ledger |
| T0 | Tokenizer | Trainer, encoder/decoder, vocabulary/merges, parity tests, and throughput report |
| M0 | Model primitives | RMSNorm, RoPE, causal attention, GQA, SwiGLU, decoder block, LM, and parity tests |
| M1 | Model ladder | Exact configs and parameter-count assertions for every ladder rung |
| S0 | Mac pre-scaling | One-batch overfit, deterministic resume, loss-decrease run, and local benchmark artifact |
| S1 | Cloud systems | Warmed timing matrix, memory traces, profiler captures, precision checks, and checkpointing comparison |
| S2 | Scaling and pretraining | A3 fit, held-out prediction, ablations, 70M checkpoint, and training report |
| E0 | Evaluation | Frozen registry, harness, confidence intervals, quality/system tables, and comparison caveats |
| P0 | Distillation data | Versioned generation graph, verifier outputs, rejection reasons, accepted data, and cost report |
| P1 | SFT | QLoRA config, checkpoints, curves, ablation, and promotion decision |
| P2 | DPO | Preference audit, DPO config, diagnostics, and promotion decision |
| R0 | Export | GGUF conversion, Q8/Q4 artifacts, checksums, parity report, and RAM/size table |
| R1 | Runtime | C++ adapter, request schema, streaming/cancellation behavior, build files, and conformance tests |
| R2 | Scheduling | Queue policy, admission control, load generator, metrics, and overload experiment |
| R3 | Qualification | Release manifest, rollback rule, reliability matrix, benchmark report, and demo |
| C0 | Portfolio release | Architecture diagram, experiment ledger, cross-layer analysis, README, and resume evidence |

Every problem ends with an observable artifact and a pass/fail gate. A plot,
benchmark, or checkpoint without its command, config, revision, input hashes,
and environment is incomplete.

#### What the Code Looks Like

The project follows the CS336 assignment pattern: implementation lives in small
importable modules, public interfaces are exercised through adapters, and tests
define the contract before scale runs begin.

```text
elenkhos-train/
  elenkhos_train/{data,tokenizer,model,training,eval,posttrain}/
  configs/{models,data,training,posttrain,eval}/
  scripts/{materialize_data,train,benchmark,profile,evaluate,generate_distill}/
  tests/{adapters.py,test_data.py,test_tokenizer.py,test_model.py,
         test_checkpoint.py,test_eval.py,test_posttrain.py}

elenkhos-serve/
  include/elenkhos/
  src/{runtime,scheduler,server,metrics}/
  configs/
  scripts/{export_gguf,benchmark_load,qualify_release}/
  tests/{unit,integration,conformance}/
```

`docs/elenkhos-starter-kit.md` supplies starter interfaces, config shapes,
commands, and test skeletons. Internal structure may change, but manifest
schemas, adapters, measurements, and promotion gates remain stable.

### 2.2 Implementation Philosophy

The project combines Karpathy-style minimalism, CS336 assignment depth, and
TinyTorch's `Build -> Use -> Reflect` progression. Minimalism applies to the
number of concepts and code paths, not to missing tests, measurements, or
failure handling.

| Reference | Principle adopted | Concrete Elenkhos requirement |
| --- | --- | --- |
| [nanochat](https://github.com/karpathy/nanochat) | one cohesive, hackable, end-to-end harness; single-node first; cost and wall-clock are first-class metrics | one command per local/cloud stage, no framework-style model factory, no multi-node dependency, and a complete data-to-release path |
| [nanoGPT](https://github.com/karpathy/nanoGPT) | a plain readable model file and training loop with enough performance for real experiments | keep the pedagogical model and trainer traceable; add optimization flags only after the eager baseline passes |
| [minGPT](https://github.com/karpathy/minGPT) | separate compact model definition, generic trainer, and small usage examples | model primitives remain independent of the trainer; every major component has one tiny executable example |
| [minbpe](https://github.com/karpathy/minbpe) | minimal byte-level BPE with transparent merges and round-trip behavior | implement the tokenizer core directly, serialize inspectable merges, and test Unicode/bytes before optimizing |
| [llm.c](https://github.com/karpathy/llm.c) | keep a simple reference implementation beside the optimized implementation | eager reference paths precede SDPA, compile, fused optimizer, or distributed paths; parity tests gate every replacement |
| [llama2.c](https://github.com/karpathy/llama2.c) | make inference lifecycle and state understandable before adding abstractions | first ship one synchronous C++ request path around the pinned backend, then add streaming, queues, admission, and release state |
| [micrograd](https://github.com/karpathy/micrograd) and [Neural Networks: Zero to Hero](https://github.com/karpathy/nn-zero-to-hero) | derive a small system, inspect intermediates, and make failures visible | use tiny tensors, hand-checkable examples, gradient checks, and one-batch overfit; do not build a second autograd engine |
| [CS336 A1-A5](https://cs336.stanford.edu/) | problem IDs, adapters, tests, written analysis, exact experiments, and explicit deliverables | every required problem maps to code, a test, a measurement, an artifact, and a completion gate |
| [TinyTorch](https://mlsysbook.ai/tinytorch/intro.html) | `Build -> Use -> Reflect`, progressing from primitives to system behavior | every lesson builds a component, uses it in the accumulating capstone, then records a design or measurement reflection |

#### Reference-Then-Optimized Rule

Every performance-sensitive subsystem has exactly two conceptual levels:

1. a readable reference implementation that establishes semantics and runs on
   tiny fixtures;
2. a selected optimized or maintained implementation used for scale, with
   parity and benchmark evidence against the reference.

| Subsystem | Reference path | Scale path | Required gate |
| --- | --- | --- | --- |
| tokenizer | direct Python byte BPE | optimized pretokenization/batched encoding only if needed | identical token IDs and round-trip corpus |
| attention | eager PyTorch MHA/GQA | PyTorch SDPA and optional `torch.compile` | output/gradient tolerance plus timing/memory table |
| optimizer | pedagogical AdamW | PyTorch fused AdamW when supported | one-step parameter/state parity |
| training | single-device explicit loop | BF16, accumulation, activation checkpointing, optional DDP | same batch semantics and matched short-run loss |
| inference lifecycle | synchronous single-request C++ adapter | streaming scheduler/admission service over llama.cpp | response/token parity plus load/fault tests |
| post-training objective | standalone completion-mask/log-prob/DPO functions | version-pinned TRL/PEFT | two-example numerical parity |

Do not add plugin systems, registries, model factories, generic pipeline DAGs,
Kubernetes, or multiple interchangeable runtimes. Configuration exists to
reproduce the frozen experiment matrix, not to turn the repository into a
general-purpose framework.

### Frozen Planning Snapshot

Record new revisions in the repository at execution time. The planning
snapshot verified on 2026-06-13 is:

| Asset | Revision |
|---|---|
| `Qwen/Qwen3-1.7B` | `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| `Qwen/Qwen3-32B-AWQ` | `0499c3ac83fdef8810b907a23894ba91e95eddd8` |
| `Qwen/Qwen3-14B-AWQ` | `31c69efc29464b6bb0aee1398b5a7b50a99340c3` |
| `openai/gsm8k` | `740312add88f781978c0658806c59bc2815b9866` |
| `Navy0067/contrastive-pairs-for-logical-fallacy` | `3421302fdba9b3e138d422135544288ff75e3e6b` |
| `taisazero/socratic-debugging-benchmark` | `92409aa435bd6a92603911a7eabd35206bd14063` |
| `yale-nlp/FOLIO` | `4c1f14bf39ca6a6de242bd8f75ef313b4b436818` |

Treat these as reproducibility pins, not claims that they will remain the latest.

Official Hugging Face metadata checked on 2026-06-13 reports approximately
4.07GB stored for Qwen3-1.7B, 9.99GB for Qwen3-14B-AWQ, and 19.34GB for
Qwen3-32B-AWQ. Stored weight size is not a VRAM guarantee: runtime workspaces,
KV cache, CUDA graphs, and batching require headroom.

## 3. CS336 Assignment Survey and Adaptation Boundary

| CS336 writeup | Exact sections adapted | Elenkhos deliverable | Explicit cut |
|---|---|---|---|
| [A1 Basics PDF](https://github.com/stanford-cs336/assignment1-basics/blob/main/cs336_assignment1_basics.pdf) | BPE; RMSNorm; RoPE; SwiGLU; attention; Transformer LM; AdamW; schedule; clipping; data loading; checkpointing; decoding; controlled ablations | `Elenkhos-70M-Lab`, tokenizer, tests, training loop, MHA/GQA ablation | course leaderboard and all architecture ablations |
| [A2 Systems PDF](https://github.com/stanford-cs336/assignment2-systems/blob/main/cs336_assignment2_systems.pdf) | benchmarking; mixed precision; memory profiling; `torch.compile`; selected single-node DDP analysis | profiler trace, memory model, one optimization, optional 1-vs-2 GPU report | custom FlashAttention backward, FSDP, tensor parallel, leaderboard |
| [A3 Scaling PDF](https://github.com/stanford-cs336/assignment3-scaling/blob/main/cs336_assignment3_scaling.pdf) | run accounting; compute-budget prediction; loss-vs-compute fitting | pre-registered run table and bounded token-budget choice | claim of discovering a general scaling law |
| [A4 Data PDF](https://github.com/stanford-cs336/assignment4-data/blob/main/cs336_assignment4_data.pdf) | inspection; language ID; PII; quality rules; classifier audit; exact and MinHash dedup; filtering; tokenization | deterministic FineWeb-Edu plus public-domain-domain mixture and dataset card | Common Crawl-scale processing |
| [A5 Alignment PDF](https://github.com/stanford-cs336/assignment5-alignment/blob/main/cs336_spring2026_assignment5_alignment.pdf) | prompting baselines; response masks; log probabilities; reward components; optional GRPO concepts | prompt-only baseline, SFT/DPO pipeline, reserve-only verified-reward experiment | full on/off-policy RL assignment |
| [A5 Safety/RLHF supplement](https://github.com/stanford-cs336/assignment5-alignment/blob/main/cs336_spring2026_assignment5_supplement_safety_rlhf.pdf) | evaluation parsers; packed SFT; response-only loss; DPO loss and evaluation | completion-only SFT, preference pairs, regression and error analysis | broad safety-model training |

The project is complete when the bounded adaptation ships. Literal completion
of A1-A5 is not required and would violate the summer capacity limit.

### 3.1 Problem-Level CS336 Contract

Use the original assignment problem names in issues, commits, tests, and
reports so a reviewer can trace the adaptation. `required` means the Elenkhos
version must ship; `written` requires an accounting/design answer but not the
full kernel or distributed implementation; `stretch` cannot block release.

#### A1 Basics

| CS336 problem family | Elenkhos adaptation | Status | Required evidence |
|---|---|---|---|
| `unicode1`, `unicode2` | explain UTF-8 boundaries and malformed-byte behavior | written | `reports/tokenizer-unicode.md` plus byte-round-trip tests |
| `train_bpe`, TinyStories/OWT experiments | deterministic byte BPE on TinyStories, then 8K/16K vocab on the frozen domain sample | required | merge-table hash, wall time, peak RAM, compression ratio, downstream loss |
| `tokenizer`, `tokenizer_experiments` | encode/decode, special tokens, streaming pretokenization, document boundaries | required | parity fixtures, Unicode fuzz test, 8K-vs-16K ablation |
| `linear`, `embedding`, `rmsnorm`, `positionwise_feedforward`, `rope` | implement bias-free linear, embedding, RMSNorm, SwiGLU, RoPE | required | primitive parity and gradient tests |
| `softmax`, scaled attention, MHA | stable softmax, masked attention, MHA reference, then GQA extension | required | PyTorch parity, causal-mask tests, MHA/GQA memory table |
| Transformer block/LM/accounting | assemble `micro-117k`, `debug-2m`, `scale-11m`, `small-28m-mha`, and `Elenkhos-70M-Lab` | required | exact parameter/FLOP/memory accounting and forward snapshot |
| cross entropy, AdamW/accounting | stable cross entropy and pedagogical AdamW before PyTorch fused AdamW | required | optimizer one-step parity and optimizer-state bytes |
| LR schedule, clipping | warmup-cosine and global-norm clipping | required | boundary tests and clipping before/after norms |
| data loading, checkpointing, training | memory-mapped batches, deterministic sampling, atomic resume | required | one-batch overfit and resumed-vs-uninterrupted equivalence |
| decoding/generation | temperature, top-k, EOS, deterministic greedy decoding | required | fixed-seed generation tests |
| experiment log, LR, batch size | machine-readable run cards, LR sweep, effective-batch comparison | required | pre-registered table including failed/neutral runs |
| broad architecture ablations and leaderboard | replace with niche-relevant MHA/GQA and data-mixture ablations | cut | rationale in limitations report |

#### A2 Systems

| CS336 problem family | Elenkhos adaptation | Status | Required evidence |
|---|---|---|---|
| benchmarking script | warmup-aware benchmark with CUDA synchronization | required | p50/p95 step time, tokens/s, peak memory, hardware/runtime metadata |
| Nsight Systems profile | one trace of the canonical small-model step | required | annotated timeline and top three bottlenecks |
| mixed precision and accumulation | FP32, BF16, and accumulation comparison | required | numeric-drift and throughput table |
| memory profiling | analytical and measured parameter/gradient/optimizer/activation memory | required | estimate-vs-observed error |
| gradient checkpointing | checkpoint every Transformer block | required | peak-memory reduction and step-time penalty |
| PyTorch attention and `torch.compile` | eager versus SDPA; eager versus one compiled path | required | tolerance, compile warmup, steady-state speed |
| FlashAttention forward/backward | explain tiled attention and roofline limits; no custom backward | written | IO-savings design note and cut rationale |
| single-node communication/DDP | deterministic 1-GPU versus 2-GPU DDP, equal global batch | stretch | loss parity, communication fraction, scaling efficiency |
| sharding, FSDP, tensor parallelism | byte/accounting exercises only | written | table showing when each technique becomes necessary |

#### A3 Scaling

The scaling assignment is not satisfied by one 70M run. Use three approximate
training-compute budgets: `8.4e14`, `1.68e15`, and `3.36e15` FLOPs. At each
budget train `scale-11m`, `small-28m-mha`, and `elenkhos-70m-lab` for
`D = floor(C / (6N))` tokens, where `N` is the measured non-embedding parameter
count from `accounting.py`, not the model nickname. Hold context length,
tokenizer, data mixture, optimizer family, and evaluation tokens fixed. Record
why `6ND` is an approximation.

The frozen parameter counts and token matrix are:

| Model | Total params | Non-embedding `N` | Low | Mid | Held-out high |
|---|---:|---:|---:|---:|---:|
| `scale-11m` | 10,694,304 | 5,975,712 | 23,428,170 | 46,856,341 | 93,712,682 |
| `small-28m-mha` | 27,534,720 | 21,243,264 | 6,590,324 | 13,180,648 | 26,361,297 |
| `elenkhos-70m-lab` | 71,205,760 | 60,720,000 | 2,305,665 | 4,611,330 | 9,222,661 |

Do not launch a run if the code-computed parameter count differs from this
table. Regenerate and recommit the entire matrix after any architecture change.

Fit a quadratic in `log(N)` to loss at each of the first two budgets, derive
their minimizing model sizes, and fit the two-point log-log trend. Before
running the third budget, commit the predicted minimizing size and loss range.
Then run the third-budget three-model sweep as a held-out test. Use the result
only to choose the final 25M/70M systems run; it is an engineering heuristic,
not a publishable general scaling law.

Required artifacts: nine frozen configs, `reports/scaling-runs.parquet`, a fit
notebook, measured/fitted plot, committed held-out prediction, prediction error,
and a sensitivity analysis that removes one noisy run.

#### A4 Data

The training backbone remains FineWeb-Edu. To prove pipeline ownership, process
the CS336 fixtures plus 500-1,000 documents from one recorded Common Crawl
index/WET path. Implement extraction, language ID, PII masking, harmful-content
flags, Gopher-style rules, exact dedup, and MinHash. Train a logistic-regression
or fastText quality classifier on 5,000 positive pages from external URLs
referenced by an English Wikipedia dump and 5,000 random Common Crawl negative
pages, following A4. Split by registrable domain so one domain cannot appear in
both train and test. If the CS336 URL list is unavailable, regenerate it from a
pinned Wikimedia dump. Audit label noise and disagreement with deterministic
rules. The raw sample is an implementation exercise, not a major training
source.

| A4 family | Required output |
|---|---|
| inspect/extract | 25-document raw inspection sheet and normalized records |
| language ID | confidence plus 20 false-positive/negative audits |
| PII | masking tests and 20 audited decisions; never publish raw PII |
| harmful content | scores, thresholds, and 20 audited disagreements |
| Gopher filters | yield per rule and five keep/five reject examples |
| quality classifier | held-out precision/recall, calibration, disagreement table |
| exact/MinHash dedup | clusters, thresholds, false-positive audit, throughput |
| filter/inspect/tokenize/train | stage manifest, token shards, controlled 25M-model ablation |

Every stage reports input/output/rejection counts, elapsed time,
documents/second, bytes/second, and a projected billion-document runtime with
assumptions.

#### A5 Alignment and Safety/RLHF Supplement

| CS336 problem family | Elenkhos adaptation | Status |
|---|---|---|
| prompting baselines and evaluators | untouched non-thinking, untouched native-thinking, and prompt-only baselines with parser, retry policy, parse-failure rate | required |
| response masks and log probabilities | completion mask and sequence-log-probability reference functions | required |
| SFT inspect/load/train/eval | inspect 100 examples, completion-only QLoRA, packed/unpacked throughput | required |
| DPO loss/train/eval | standalone reference loss, TRL parity fixture, bounded beta sweep | required |
| reward/GRPO primitives | reward-component unit tests; full GRPO remains reserve-only | written |
| red-team evaluation | 100 cases for evasion, leading questions, leakage, false premises, endless questioning | required |

The A5 report includes parse success, final correctness, behavior metrics,
token cost, latency, and source-level confidence intervals for every baseline.
A judge score may supplement but never replace deterministic or human labels.

## 4. Learning Objectives

After completing the project, you should be able to:

1. explain and implement the data-to-checkpoint path of a decoder-only LLM;
2. derive model parameter, activation, optimizer, KV-cache, and token-cost
   estimates before running an experiment;
3. build a dataset where the target behavior is observable and falsifiable;
4. distinguish prompting, SFT distillation, and preference optimization;
5. design evaluation that detects premature answering and useless questioning;
6. deploy the same model through local and cloud profiles;
7. implement release gates, canary decisions, and rollback in C++;
8. defend what the project owns versus what PyTorch, TRL, llama.cpp, and vLLM
   provide.

## 5. Repository and Environment Setup

### 5.1 Repository Layout

The complete file-by-file scaffold, configuration examples, test skeletons,
Make targets, CMake starter, manifest schemas, and benchmark commands live in
[[elenkhos-starter-kit]]. The minimum top-level structure is:

```text
elenkhos-train/
  pyproject.toml
  uv.lock
  configs/
    data/
    model/
    train/
    posttrain/
    eval/
  src/elenkhos/
    data/
    tokenizer/
    model/
    training/
    posttrain/
    evaluation/
    release/
  tests/
    adapters.py
    test_data.py
    test_tokenizer.py
    test_model.py
    test_training.py
    test_posttrain.py
    test_evaluation.py
    fixtures/
  scripts/
  reports/
  artifacts/
    manifests/
  dataset-card.md
  model-card.md
  README.md

elenkhos-serve/
  CMakeLists.txt
  cmake/
  include/elenkhos/
    engine/
    service/
    scheduler/
    admission/
    release/
    metrics/
  src/
  tests/
  bench/
  clients/
  configs/
  releases/
    manifests/
    qualification/
    incidents/
  reports/
  Dockerfile
  README.md
```

### 5.2 Supported Environments

| Environment | Required use |
|---|---|
| Google Colab | CPU tests, tokenizer/data smoke, and at most a short GPU pilot; Colab does not guarantee GPU type, session length, or persistence |
| one Runpod 24GB CUDA Pod | default canonical environment for 70M pretraining, 1.7B QLoRA SFT/DPO, 14B-AWQ teacher generation when selected, and the vLLM comparison |
| one Runpod 48GB CUDA Pod | 32B-AWQ side of the 200-item teacher pilot and full teacher generation only if the pilot selects it; DPO only after measured 24GB OOM/headroom or lower projected total cost |
| 16GB Apple Silicon MacBook Pro M4 | local development, unit tests, export validation, and the target llama.cpp/Metal constrained-inference profile |
| optional two-GPU single node | stretch-only 1-vs-2 GPU DDP scaling experiment after all single-GPU acceptance gates pass |

The Mac is a mandatory promotion environment, not merely an editor. Use Colab
only when losing the runtime would not lose more than 30 minutes of work. Do
not create a paid Runpod Pod until the local promotion gate below passes. Use a
regular Runpod Pod for every canonical run after promotion. Current GPU and
storage prices must be read from [Runpod pricing](https://www.runpod.io/pricing)
at launch time; do not encode prices in configs. Do not add multi-node
infrastructure. Multi-GPU is optional evidence, not a completion requirement.

Price snapshot checked 2026-06-14: A5000 24GB USD 0.27/hour, A40 48GB
USD 0.44/hour, RTX 3090 24GB USD 0.46/hour, A6000 48GB USD 0.49/hour, and
RTX 4090 24GB USD 0.69/hour. Standard network storage under 1TB was
USD 0.07/GB/month (about USD 4.20/month for 60GB or USD 5.60 for 80GB);
volume disk was
USD 0.10/GB/month while running and USD 0.20/GB/month while idle. These
numbers are planning inputs, not a purchase rule. Benchmark the cheapest
available 24GB option and one faster alternative for 5M representative tokens;
select by measured dollars per 100M tokens. For the 48GB Pod, begin with the
cheaper available A40/A6000-class option for the teacher pilot, continue only
if that teacher wins the measured acceptance/throughput/cost decision, and stop
the Pod immediately afterward. DPO starts on 24GB.

### 5.3 CS336-Style Local Promotion Ladder

CS336 separates correctness work, bounded experiments, fixed-budget run
selection, and the final expensive run. Apply the same discipline locally:
small runs validate the machinery and reduce paid failures; they do not become
evidence for a scaling-law claim.

| Level | Data | Model subset | Required work | Promotion evidence |
|---|---|---|---|---|
| `L0-fixture` | `fixture-100k` plus CS336 A1 fixtures | `micro-117k` | primitive parity, gradient checks, causal mask, one-batch overfit | all CPU tests pass; loss approaches zero on one batch |
| `L1-integration` | deterministic prefix of `local-pretrain-10m` | `debug-2m`, 1M train tokens | loader/tokenizer/model/optimizer/eval/checkpoint path | uninterrupted and resumed runs match within documented tolerance |
| `L2-a3-rehearsal` | `local-pretrain-10m`; fixed order and validation slice | canonical `scale-11m`, `small-28m-mha`, and `elenkhos-70m-lab` | one IsoFLOPs profile at `C=1.0e14`; run/evaluate/log/fit/plot using production code | configs finish or produce a documented resource rejection; fitter consumes the run schema |
| `L3-posttrain` | 32 cached teacher records; 128 SFT and 128 preference records | standalone objectives, then Qwen3-0.6B as compatibility substitute | schema/verifier, response masks, log-probability and loss parity, one optimizer step | no teacher GPU and no 1.7B quality claim |
| `L4-serving` | seeded short/mixed/overload traces | 70M fixture and Qwen3-0.6B Q4 fixture | export/load, streaming API, cancellation, memory admission, rollback | C++/Python fixtures pass; no leak or unbounded queue |

The local A3 rehearsal uses the same `D = floor(C / (6N))` rule as the
canonical matrix:

| Model | Non-embedding `N` | Local `C` | Local train tokens `D` |
|---|---:|---:|---:|
| `scale-11m` | 5,975,712 | `1.0e14` | 2,789,067 |
| `small-28m-mha` | 21,243,264 | `1.0e14` | 784,562 |
| `elenkhos-70m-lab` | 60,720,000 | `1.0e14` | 274,483 |

Freeze tokenizer, context, optimizer family, data order, evaluation tokens,
and seed policy across these runs. Code rounds token counts down to a complete
global-batch multiple and records the result. This single noisy profile is a
harness rehearsal only. Do not use it to choose the final model or report a
fitted scaling law.

Promote to paid compute only when `L0-L4` pass, data selection reproduces the
same document hashes, checkpoint resume parity passes, the A3 run-record and
fit pipeline completes end to end, project disk use is at most 60GB with at
least 100GB host free, and the Runpod 5M-token pilot config is pre-costed.

Primary method reference: [CS336 A3, Sections 2-3](https://github.com/stanford-cs336/assignment3-scaling/blob/main/cs336_assignment3_scaling.pdf)
for fixed compute budgets, `C≈6ND`, deterministic data order, budget accounting,
and reproducible methodology. Use [CS336 A1](https://github.com/stanford-cs336/assignment1-basics/blob/main/cs336_assignment1_basics.pdf)
for primitive tests, one-batch overfit, the training loop, and checkpoints.

### 5.4 Storage and Artifact Layout

The laptop has a 512GB internal SSD, not 512GB of project capacity. Keep the
project below 60GB and never consume the final 100GB of host free space. Do not
cache either teacher model on the Mac.

| Local category | Cap |
|---|---:|
| raw/curated local data and manifests | 4GB |
| `uint16` token shards | 2GB |
| Hugging Face cache: Qwen3-0.6B/1.7B only | 10GB |
| debug checkpoints and model-only milestones | 10GB |
| cached distillation fixtures, adapters, and logs | 3GB |
| GGUF releases, llama.cpp build, and benchmark traces | 12GB |
| temporary materialization/export files | 4GB |
| project headroom | 15GB |
| **total cap** | **60GB** |

After local promotion, allocate a 60GB Runpod volume for the 14B-teacher path.
Use 80GB only if the teacher pilot selects 32B or a measured preflight proves
60GB cannot retain required artifacts plus 15GB free. Use local container disk
only for disposable build files.

```text
/workspace/elenkhos/
  cache/huggingface/       # model/dataset cache; delete rejected teacher
  data/raw-audit/          # private, redacted CC audit only
  data/curated/            # normalized Parquet/JSONL
  data/tokenized/          # uint16 .bin + index files
  artifacts/checkpoints/   # rotating full-state checkpoints
  artifacts/adapters/      # SFT/DPO adapters
  artifacts/releases/      # merged HF, GGUF Q8/Q4, manifests
  reports/                 # metrics, traces, figures, incident reports
```

Set `HF_HOME=/workspace/elenkhos/cache/huggingface` and keep at least 15GB
free before any GPU run. The 80GB maximum-tier budget is:

| Category | Working budget | Rule |
|---|---:|---|
| Hugging Face model cache | 35GB | never retain both teacher caches after the pilot |
| raw-web audit and normalized text | 3GB | no unredacted PII in public artifacts |
| tokenized pretraining corpora | 2GB | `uint16`; one 300M shard is about 0.6GB |
| pretraining checkpoints | 8GB | two rotating full states plus milestone/model-only checkpoints |
| post-training data, adapters, logs | 6GB | adapter weights are about 70MB; retain optimizer state only for resumable runs |
| merged/GGUF releases and benchmarks | 10GB | base/SFT/DPO, Q8/Q4, raw event logs |
| required headroom | 16GB | downloads, temporary export files, allocator spill |

Git stores code, schemas, configs, manifests, small fixtures, and reports only.
Publish sanitized datasets through a Hugging Face dataset repository and
adapters/models through a model repository after license and PII review. Keep
raw Common Crawl pages and rejected sensitive examples private. See the
official [dataset upload](https://huggingface.co/docs/hub/en/datasets-adding)
and [model upload](https://huggingface.co/docs/hub/en/models-uploading)
documentation.

### 5.5 Python Stack

- Python 3.11 or 3.12
- `uv`
- PyTorch
- `transformers`
- `datasets`
- `accelerate`
- `peft`
- `trl`
- `safetensors`
- `pytest`
- `ruff`
- `mypy`
- `hydra-core` or typed YAML/dataclass configuration
- `datasketch` or an equivalent tested MinHash implementation

### 5.6 C++ Stack

- C++20
- CMake 3.25+
- llama.cpp pinned as a submodule or reproducibly fetched dependency
- one maintained HTTP library
- `nlohmann/json`
- GoogleTest or Catch2
- sanitizers in CI
- Python benchmark client using `httpx` or `aiohttp`

### 5.7 Abstraction-Level Contract

| Pipeline | Implement and own | Delegate | Why this is the best resume level |
|---|---|---|---|
| data | source schema, deterministic selection, filters, dedup, grouped splits, contamination, manifests, audits | Hugging Face streaming/Arrow/Parquet; tested MinHash and classifier primitives | proves data engineering and experiment validity without building a distributed lake |
| tokenizer/model | byte BPE, RMSNorm, RoPE, eager attention, GQA, SwiGLU, decoder, accounting, micro-tests | PyTorch tensors, autograd, later SDPA | exposes the internals interviewers probe while avoiding low-value tensor-kernel work |
| pretraining | custom loop, schedule wiring, checkpoint/resume, memory model, profiling, scaling fit | PyTorch profiler, `torch.compile`, SDPA | proves training-systems ownership; a high-level Trainer would hide the relevant work |
| teacher generation | schemas, prompts, verifiers, pilot decision, cost model, retries, data acceptance | Transformers/vLLM inference and Distilabel orchestration | the differentiator is verified data and measured teacher selection, not another server |
| SFT/DPO | formatting, masks, preference pairs, tiny reference-loss parity, configs, stop rules, evaluation | version-pinned TRL/PEFT/BitsAndBytes/Accelerate | legitimate production post-training without wasting the summer rewriting mature trainer infrastructure |
| export | merge checks, tokenizer parity, manifest, checksums, quality gate | official llama.cpp GGUF conversion and quantization | proves release lineage and quantization decisions without claiming custom kernels |
| serving | C++ backend interface, lifecycle, streaming, deadlines, scheduler, admission, canary, rollback, metrics | llama.cpp tokenizer/kernels/KV store; vLLM comparison only | owns the control plane where junior AI-systems roles have credible scope |
| reporting | joined manifests, reproducible tables, confidence intervals, limitations, failed result | lightweight Python/pandas/Markdown | makes the system auditable; a dashboard or MLOps platform would add maintenance, not evidence |

Explicitly out of scope: custom FlashAttention backward, a new quantization
kernel, a full serving engine, Kubernetes, multi-node training, and a custom
RLHF framework. Each can become a later specialization only after the canonical
pipeline ships.

## 6. Starter-Code Contract

Follow the CS336 adapter pattern: tests call small stable interfaces while the
internal design remains yours.

### 6.1 Training Adapters

```python
from pathlib import Path
from typing import Iterable

import torch
from torch import Tensor


def build_data_manifest(
    sources: list[dict],
    output_path: Path,
    seed: int,
) -> dict:
    """Freeze source revisions, licenses, hashes, row selectors, and exclusions."""


def curate_documents(
    records: Iterable[dict],
    config: dict,
) -> Iterable[dict]:
    """Normalize, filter, mask PII, deduplicate, and emit stage decisions."""


def train_bpe(
    input_path: Path,
    vocab_size: int,
    special_tokens: list[str],
) -> tuple[dict[int, bytes], list[tuple[bytes, bytes]]]:
    """Train deterministic byte-level BPE."""


def run_linear(
    d_in: int,
    d_out: int,
    weights: Tensor,
    inputs: Tensor,
) -> Tensor:
    """Run the project's bias-free linear primitive."""


def run_rmsnorm(
    d_model: int,
    eps: float,
    weights: Tensor,
    inputs: Tensor,
) -> Tensor:
    """Run RMSNorm with float32 accumulation."""


def run_rope(
    d_k: int,
    theta: float,
    max_seq_len: int,
    inputs: Tensor,
    positions: Tensor,
) -> Tensor:
    """Apply rotary position embeddings."""


def run_attention(
    q: Tensor,
    k: Tensor,
    v: Tensor,
    mask: Tensor | None,
) -> Tensor:
    """Run stable scaled dot-product attention."""


def run_transformer_lm(
    config: dict,
    weights: dict[str, Tensor],
    input_ids: Tensor,
) -> Tensor:
    """Return logits from the from-scratch decoder."""


def run_cross_entropy(logits: Tensor, targets: Tensor) -> Tensor:
    """Return mean token loss without materializing softmax probabilities."""


def get_lr_cosine_schedule(
    step: int,
    warmup_steps: int,
    total_steps: int,
    max_lr: float,
    min_lr: float,
) -> float:
    """Return the warmup-plus-cosine learning rate."""


def clip_gradients(parameters: Iterable[Tensor], max_l2_norm: float) -> float:
    """Clip global gradient norm and return the pre-clip norm."""


def save_checkpoint(path: Path, state: dict) -> None:
    """Atomically save model, optimizer, scheduler, RNG, data, and run state."""


def load_checkpoint(path: Path) -> dict:
    """Restore enough state to reproduce the next training step."""


def tokenize_trajectory_batch(
    prompts: list[str],
    completions: list[str],
    tokenizer,
) -> dict[str, Tensor]:
    """Return input_ids, labels, attention_mask, and completion_mask."""


def validate_trajectory(example: dict) -> dict:
    """Return verifier components, acceptance decision, and rejection reasons."""


def score_question_policy(
    prediction: dict,
    reference: dict,
) -> dict[str, float]:
    """Score required-slot recall, question precision, leakage, and answer timing."""
```

### 6.2 Serving Interfaces

```cpp
struct GenerationRequest {
  std::string request_id;
  std::vector<int32_t> prompt_tokens;
  uint32_t max_new_tokens;
  std::chrono::steady_clock::time_point deadline;
  std::string release_id;
};

struct CapacityEstimate {
  uint64_t prompt_tokens;
  uint64_t generation_tokens;
  uint64_t estimated_kv_bytes;
  bool admissible;
  std::string reason;
};

class Engine {
 public:
  virtual ~Engine() = default;
  virtual void Load(const ReleaseManifest& manifest) = 0;
  virtual void Generate(
      const GenerationRequest& request,
      TokenCallback on_token,
      CompletionCallback on_complete) = 0;
  virtual void Cancel(std::string_view request_id) = 0;
};

class Scheduler {
 public:
  virtual EnqueueResult Enqueue(GenerationRequest request) = 0;
  virtual std::optional<GenerationRequest> Next() = 0;
  virtual void Complete(std::string_view request_id) = 0;
};

class QualificationGate {
 public:
  virtual GateResult Evaluate(
      const ReleaseManifest& candidate,
      const QualificationEvidence& evidence) const = 0;
};
```

### 6.3 Required Starter Tests

Provide failing tests before implementation for:

- deterministic data selection and document-hash splits;
- exact and near-duplicate removal;
- Unicode tokenizer round trips and special tokens;
- causal masking, RoPE, RMSNorm, SwiGLU, MHA, and GQA;
- one-batch overfit and checkpoint-resume equivalence;
- completion-only loss masks;
- DPO chosen/rejected ordering;
- question-policy metrics;
- queue capacity, cancellation, timeout, overload, shutdown, and release
  state-machine transitions.

## 7. Part A: Data and Provenance

### Problem

The data system must curate four different families without allowing provenance
or evaluation leakage to diverge between them: pretraining text, verified
distillation trajectories, DPO preference pairs, and held-out evaluation
fixtures. The previous plan also treated a small philosophy bookshelf as if it
could supply hundreds of millions of unique tokens. It cannot; repetition would
make the experiment misleading.

### Unified Data Families

| Family | Default scale | Storage form | Split and contamination rule |
|---|---:|---|---|
| pretraining | 10M smoke, 50M controls, 300M final | compressed Parquet metadata/text plus `uint16` token shards | document/work hash 98/1/1; every evaluation item hash excluded |
| distillation trajectories | 2K, then 4K accepted; 8K cap | structured JSONL/Arrow with source, prompt, final output, verifier results | 80/10/10 grouped by source/document/problem/template family |
| DPO preference pairs | 4K default; 8K maximum | chosen/rejected Arrow rows plus named corruption metadata | inherits the source-family grouping; no pair crosses splits |
| evaluation | 200 human ElenkhosBench items plus external FOLIO and Socratic debugging | immutable JSONL with hashes and parser version | external-only; never used for pretraining, SFT, teacher selection, or DPO |

All four families use one source manifest schema: `source_id`, license,
retrieval/model revision, content checksum, parent/group IDs, split, generation
configuration, verifier decisions, and permitted uses. The data lesson owns
this schema; later lessons may append derived fields but may not redefine
provenance, splits, or contamination rules.

### Exact Pretraining Sources

| Source | Use | License rule |
|---|---|---|
| [`roneneldan/TinyStories`](https://huggingface.co/datasets/roneneldan/TinyStories) | 10M-token smoke and overfit fixtures only | record dataset revision and displayed license |
| [`HuggingFaceFW/fineweb-edu`](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu), `sample-10BT` | general and mixture backbone | ODC-By; retain attribution |
| Project Gutenberg philosophy texts | domain slice, argument passages, optional RAG | public-domain status checked per text and translation |

### Philosophy Source Manifest

Use philosophy as a source of reasoning forms and argument structure, not as a
truth oracle. Start with this bounded, edition-pinned shelf:

| Source ID | Work | Gutenberg ID | Primary use |
|---|---|---:|---|
| `pg-plato-republic` | Plato, *The Republic* | [1497](https://www.gutenberg.org/ebooks/1497) | dialogue, argument reconstruction |
| `pg-aristotle-ethics` | Aristotle, *Nicomachean Ethics* | [8438](https://www.gutenberg.org/ebooks/8438) | premise/conclusion extraction |
| `pg-hume-enquiry` | Hume, *Enquiry Concerning Human Understanding* | [9662](https://www.gutenberg.org/ebooks/9662) | hidden assumptions and induction |
| `pg-locke-understanding-v1` | Locke, *Essay Concerning Humane Understanding*, Vol. 1 | [10615](https://www.gutenberg.org/ebooks/10615) | definitions and counterexamples |
| `pg-mill-utilitarianism` | Mill, *Utilitarianism* | [11224](https://www.gutenberg.org/ebooks/11224) | thesis/objection/reply |
| `pg-wollstonecraft-rights` | Wollstonecraft, *Vindication of the Rights of Woman* | [3420](https://www.gutenberg.org/ebooks/3420) | political and normative argument |
| `pg-nietzsche-bge` | Nietzsche, *Beyond Good and Evil* | [4363](https://www.gutenberg.org/ebooks/4363) | aphorism-to-argument stress test |
| `pg-confucian-analects` | Legge translation, *Confucian Analects* | [4094](https://www.gutenberg.org/ebooks/4094) | maxim interpretation and missing premises |
| `pg-descartes-meditations` | Descartes, *Six Metaphysical Meditations* | [70091](https://www.gutenberg.org/ebooks/70091) | doubt and premise chains |

Candidate expansion sources, activated only if the default shelf lacks enough
accepted passages: *Dhammapada* [2017](https://www.gutenberg.org/ebooks/2017),
Marcus Aurelius's *Meditations* [2680](https://www.gutenberg.org/ebooks/2680),
and Du Bois's *The Souls of Black Folk*
[408](https://www.gutenberg.org/ebooks/408). Apply the same edition,
translation, provenance, author-cap, and held-out-work rules; do not increase
the accepted-example target merely because more text is available.

Before download, query item metadata and store its displayed copyright flag,
title, author, translator/editor, language, format URL, retrieval date, and
SHA-256. Project Gutenberg status is jurisdiction-specific, and translations
can have separate rights. Exclude an item if status, edition, or translator is
ambiguous. Strip the Gutenberg header/footer and trademark wording from model
text while retaining attribution in the dataset card.

Optional, separately licensed source:
[OpenGreekAndLatin First1KGreek](https://github.com/OpenGreekAndLatin/First1KGreek)
for original-language comparison. It is CC BY-SA 4.0; do not mix it into the
default shard unless attribution and share-alike handling are documented.

Do **not** train on Stanford Encyclopedia of Philosophy, Internet Encyclopedia
of Philosophy, contemporary books, course notes, or scraped forums. They can
inform human rubric design, but their prose must not enter examples without an
explicit compatible license.

### Philosophy Passage Construction

1. Parse HTML when available and retain headings, paragraphs, speaker names,
   book/chapter IDs, and footnote references.
2. Remove contents pages, indexes, ads, OCR debris, and editorial notes.
3. Create 120-600-token candidates with one-paragraph overlap.
4. Use discourse markers and dialogue structure only to prioritize review, not
   as ground-truth labels.
5. Human-review 1,600 candidates into `argument`, `dialogue`, `exposition`,
   `aphorism`, or `reject`.
6. Retain 1,000 argument passages and 800 thesis/objection seeds; cap each
   author at 15% of accepted examples.
7. Split by complete work or author. Hold out at least two authors entirely;
   no chapter, translation, or near-duplicate crosses into training.
8. Double-label 50 of a 200-passage gold set and report agreement.

For each gold passage annotate premises, conclusion, hidden assumption,
strongest objection, answerability, and annotator confidence. Teacher outputs
are candidates only and must be checked against the source passage.

### Frozen Data Recipe

1. Stream FineWeb-Edu `sample-10BT`.
2. Deterministically select rows using `sha256(document_id || seed)`.
3. Build the public-domain philosophy source manifest from explicit Gutenberg
   IDs, author, work, translator, publication year, retrieval URL, and checksum.
4. Remove boilerplate and license headers while preserving provenance.
5. Apply language, length, repetition, symbol-ratio, PII, exact-dedup, and
   MinHash near-dedup stages.
6. Split by source-document hash, never by chunk.
7. Do not repeat philosophy documents to hit a token target.

Do not download the 6.19TB FineWeb-Edu repository. Use
[`load_dataset(..., streaming=True)`](https://huggingface.co/docs/datasets/stream)
and materialize only selected records. The nine-book shelf is expected to
produce roughly 2M-4M unique tokens after cleaning; measure the exact count
before freezing the mixture. The percentage is a ceiling, not a quota.

### Streaming Versus Training Boundary

Remote streaming is an acquisition mechanism, not the training data loader.
This distinction is mandatory:

1. `materialize_data.py` opens the pinned Hugging Face dataset with
   `streaming=True`, selects rows by a stable hash, applies bounded filters,
   and writes normalized compressed Parquet plus a selected-document manifest.
2. `tokenize_data.py` reads the materialized snapshot, applies the frozen
   tokenizer, and writes immutable `uint16` token shards, document-boundary
   indices, split indices, checksums, and token counts.
3. `train.py` reads only those local or Runpod-volume shards through
   memory-mapped files. It never depends on network order, a live dataset
   iterator, or an unversioned cache.
4. Local and cloud runs consume shards produced by the same code path. The
   corpus size changes; selection, filtering, tokenization, manifest schema,
   and loader semantics do not.

This design costs a small materialization step but makes data order,
checkpoint resume, held-out splits, and A3 comparisons reproducible. It also
prevents network stalls from being misdiagnosed as model or GPU performance.

| Stage | Snapshot | Expected token-shard size | Purpose |
| --- | --- | ---: | --- |
| unit | `fixture-100k` | about 0.2MB | parser, tokenizer, loader, and boundary tests |
| Mac integration | first deterministic 1M tokens of `local-pretrain-10m` | about 2MB | end-to-end debug and resume |
| Mac pre-scaling | `local-pretrain-10m` | about 20MB | production data-path rehearsal and local A3 harness |
| cloud pilot/ablation | `web-50m` and `domainmix-50m` | about 100MB each | hardware pilot and controlled data ablation |
| cloud final | `domainmix-300m` | about 600MB | final 70M run |

The shard sizes are raw `uint16` estimates. Parquet text, manifests, indices,
temporary files, and checkpoints are budgeted separately in Section 5.4.

### Required Corpora

| Corpus ID | Token budget | Composition |
|---|---:|---|
| `fixture-100k` | 100K | tiny deterministic CS336-style records for tokenizer, loader, and unit tests |
| `local-pretrain-10m` | 10M | 9M FineWeb-Edu plus at most 1M eligible unique philosophy tokens; production filters and splits |
| `web-50m` | 50M | FineWeb-Edu only |
| `domainmix-50m` | 50M | all eligible unique philosophy training tokens once, expected 2M-4M and capped at 5M; fill the remainder with FineWeb-Edu |
| `domainmix-300m` | 300M | reuse the same unique philosophy training documents once; fill the remainder with FineWeb-Edu |

TinyStories may remain an isolated loader fixture, but it is not the local
end-to-end corpus because it does not exercise the real data mixture. Expected
disk after tokenization with the 16K tokenizer is approximately 20MB
for 10M tokens, 200MB for 100M, and 600MB for 300M using `uint16`. Keep
document metadata and text separately in compressed Parquet; budget 1GB-3GB
for all selected text, indices, manifests, and temporary shards.

### Required Experiments

1. `web-50m` versus `domainmix-50m` on `small-25m-gqa`.
2. exact dedup versus exact plus MinHash dedup.
3. 8K versus 16K BPE vocabulary.
4. contamination check against every `ElenkhosBench` test item.

### Deliverables

- `artifacts/manifests/data-sources.json`
- `artifacts/manifests/selected-documents.parquet`
- `reports/data-stage-yields.json`
- `dataset-card.md`
- one before/after sample table for every filter
- one rejected-example audit sampled after each stage

### Completion Gate

- rerunning with the same revision and seed selects the same document hashes;
- no source document appears in more than one split;
- every retained record has source, license, checksum, and stage decisions;
- the data ablation changes only the corpus composition.

## 8. Part B: `Elenkhos-70M-Lab`

### Purpose

This model is the systems-learning artifact, and the only model trained from
scratch. It is pretraining-only: it is never post-trained, and it is not, and
must not be marketed as, a competitive reasoning model. Its explicit value is:

- a pretraining-quality baseline that proves the from-scratch training system
  works (tokenizer, decoder, optimizer, checkpoint, resumable run);
- the data-mixture and MHA-vs-GQA ablation target;
- the A3 scaling-law test subject (the nine-run, third-budget-held-out study);
- the profiler, memory-model, and checkpoint artifact for the systems report;
- a weak-reasoning negative control: its held-out reasoning scores set the
  floor the distilled Qwen3-1.7B must clear, demonstrating why distillation
  rather than from-scratch pretraining produces the reasoning product;
- a release-manifest and reference-serving fixture for ElenkhosServe (a small,
  fast model to exercise the export, quantization, and qualification pipeline
  before the 1.7B release).

The final report must place `Elenkhos-70M-Lab` in the same benchmark table as
the served Qwen lineage. This is a floor comparison, not a claim of equal model
class:

| Benchmark family | 70M role | Compared serving releases |
|---|---|---|
| held-out FineWeb-Edu loss/perplexity | from-scratch general-language floor | Qwen3-1.7B base, SFT, DPO |
| held-out philosophy loss/perplexity | domain-mixture effect and overfit check | Qwen3-1.7B base, SFT, DPO |
| fixed-few-shot `ElenkhosBench` | intentionally weak Socratic-policy negative control | non-thinking base, native-thinking base, prompt-only, answer-only SFT, trajectory SFT, DPO |
| FOLIO | external logical-validity floor | the same Qwen releases |
| throughput, peak memory, KV bytes/token | small reference-serving fixture and GQA evidence | Q8_0/Q4_K_M Qwen releases on their qualified hardware profiles |

Do not compare raw throughput across unlike hardware as a model-quality claim.
Use the 70M fixture to prove that the same export, manifest, request, metric,
and qualification code paths work before the larger release, then report the
Qwen model as the actual reasoning product.

### Exact Configurations

| Config | Layers | `d_model` | Q heads | KV heads | `d_ff` | Context | Vocab |
|---|---:|---:|---:|---:|---:|---:|---:|
| `micro-117k` | 2 | 64 | 4 | 4 | 176 | 64 | 256 |
| `debug-2m` | 4 | 128 | 4 | 4 | 352 | 128 | 8,192 |
| `scale-11m` | 6 | 288 | 6 | 6 | 768 | 512 | 16,384 |
| `small-28m-mha` | 12 | 384 | 6 | 6 | 1,024 | 512 | 16,384 |
| `small-25m-gqa` | 12 | 384 | 6 | 2 | 1,024 | 512 | 16,384 |
| `elenkhos-70m-lab` | 13 | 640 | 10 | 5 | 1,792 | 1,024 | 16,384 |

The three A3 scaling models (`scale-11m`, `small-28m-mha`, `elenkhos-70m-lab`)
and the `small-25m-gqa` ablation all share the frozen 16,384-token BPE
tokenizer, so the scaling study no longer compares different tokenizers.
`micro-117k` (a 256-token byte-level unit-test fixture) and `debug-2m` (the
retained integration-smoke fixture on its existing 8,192 vocabulary) are test
fixtures only and are excluded from the tokenizer-controlled scaling comparison.

Expected totals are 117,056 (`micro-117k`); 1,852,544 (`debug-2m`); 10,694,304
(`scale-11m`); 27,534,720 (`small-28m-mha`); 25,175,424 (`small-25m-gqa`); and
71,205,760 (`elenkhos-70m-lab`) parameters. Tests must recompute these values
from config.

### GPT-2-Inspired Ladder, With Deliberate Modernizations

Use GPT-2 and the CS336 A2 model table as a reference for a simple dense
decoder baseline and for disciplined depth/width scaling, not as an
architecture to copy unchanged. The `small-28m-*` pair retains GPT-2-small's
12-layer depth while reducing width, vocabulary, and feed-forward size so the
controlled experiment fits the summer budget. `Elenkhos-70M-Lab` increases
width to 640 and uses 13 layers because that preserves clean 64-dimensional
attention heads, a 2:1 query/KV-head ratio, and the exact 71.2M target.

| GPT-2-era choice | Elenkhos choice | System reason |
| --- | --- | --- |
| learned absolute position embeddings | RoPE | removes a learned position table and matches current decoder practice |
| post/standard LayerNorm | pre-norm RMSNorm | simpler normalization and stable small-model optimization |
| GELU 4x MLP | SwiGLU with rounded `d_ff` | stronger modern baseline while retaining explicit parameter accounting |
| biased projections | bias-free projections | simpler kernels and accounting |
| MHA everywhere | MHA reference, controlled GQA ablation, GQA final | directly measures KV-memory and serving tradeoffs |
| untied or separately counted output head | tied token embedding/LM head | saves parameters and keeps the 70M budget focused on decoder capacity |
| dropout in the reference recipe | no dropout in the primary run | reduces small-run variance; data and optimization remain the controlled variables |

Each rung has one job:

- `micro-117k`: primitive parity, gradients, causal masking, and one-batch
  overfit;
- `debug-2m`: integration of production loader, tokenizer, checkpoint, resume,
  and evaluation code;
- `scale-11m`: low-compute anchor for the A3 fit;
- `small-28m-mha` / `small-25m-gqa`: GPT-2-depth controlled attention and
  data-mixture experiments;
- `Elenkhos-70M-Lab`: held-out scaling prediction, final pretraining,
  profiling, negative-control evaluation, and reference release fixture.

### Decoder Contract

```text
token embedding
  -> repeat N times:
       RMSNorm
       -> Q/K/V projections
       -> RoPE(Q, K)
       -> causal attention
       -> output projection
       -> residual
       -> RMSNorm
       -> SwiGLU
       -> residual
  -> final RMSNorm
  -> tied LM head
```

Decisions:

- pre-norm;
- bias-free projections;
- RMSNorm epsilon `1e-5`;
- RoPE base `10,000` for the lab model;
- tied embeddings;
- no dropout in the primary run;
- MHA correctness implementation before GQA;
- eager attention before PyTorch SDPA;
- standard AdamW implementation before fused AdamW comparison.

### Required Correctness Sequence

1. compare each primitive to a PyTorch reference;
2. verify causal-mask broadcasting;
3. run finite-difference or autograd gradient checks on tiny tensors;
4. snapshot a complete forward pass;
5. overfit one batch to near-zero loss;
6. resume from a checkpoint and match the uninterrupted loss trajectory;
7. compare MHA and GQA under equal model dimensions and token budgets.

### Required Accounting

Report:

- parameters by embedding, attention, MLP, and normalization;
- KV bytes per generated token for MHA and GQA;
- estimated forward/backward FLOPs per token;
- parameter, gradient, optimizer, and activation memory;
- measured peak memory versus estimate.

## 9. Part C: Pretraining and Systems

### 9.1 S0: Mac Pre-Scaling and Correctness

The Mac phase is a correctness and experiment-harness qualification phase. It
does not establish GPU throughput, scaling laws, or final model quality.

Break the work into these subproblems:

1. **S0.1 primitive qualification:** run CPU/MPS primitive parity, gradient,
   causal-mask, and parameter-count tests on `micro-117k`.
2. **S0.2 data-path qualification:** materialize `fixture-100k` and
   `local-pretrain-10m`, freeze hashes, tokenize to `uint16`, and verify that
   document boundaries and held-out splits survive round trips.
3. **S0.3 optimization qualification:** overfit one fixed batch, then train
   `debug-2m` for 1M tokens and require finite loss, declining validation loss,
   bounded gradient norms, and no skipped optimizer steps.
4. **S0.4 checkpoint qualification:** interrupt at a pre-registered step,
   resume from full state, and compare parameters, optimizer state, RNG state,
   sampler position, and subsequent loss to the uninterrupted run.
5. **S0.5 experiment-harness rehearsal:** run the three local A3 points from
   Section 5.3, emit the same run-card schema used in cloud, fit the plotting
   pipeline, and label the result `rehearsal_only=true`.

Required commands:

```bash
uv run pytest tests/test_model.py tests/test_training.py tests/test_checkpoint.py
uv run python scripts/materialize_data.py --config configs/data/local-pretrain-10m.yaml
uv run python scripts/tokenize_data.py --config configs/data/local-pretrain-10m.yaml
uv run python scripts/train.py --config configs/train/debug-2m-local.yaml
uv run python scripts/check_resume_parity.py --run artifacts/runs/debug-2m-local
uv run python scripts/run_a3_matrix.py --config configs/train/a3-local-rehearsal.yaml
```

S0 passes only when every command is rerunnable from a clean checkout, local
disk use remains within the 60GB cap, and the resulting manifest identifies
code revision, data hash, tokenizer hash, config hash, device, precision, seed,
and wall time.

### 9.2 Shared Training Recipe

| Setting | Value |
|---|---|
| optimizer | AdamW |
| betas | `(0.9, 0.95)` |
| epsilon | `1e-8` |
| weight decay | `0.1` |
| gradient clip | `1.0` |
| precision | BF16 on the selected 24GB Runpod CUDA GPU; Colab and local Mac runs are smoke tests only |
| schedule | linear warmup then cosine decay |
| warmup | 1% of total tokens |
| peak LR search | `3e-4`, `5e-4`, `8e-4` on the small model |
| checkpoint policy | keep two rotating full-state checkpoints; preserve model-only milestones at 0%, 25%, 50%, 75%, and 100% |
| evaluation interval | fixed token intervals, not epochs |

### Required Run Table

| Run | Model | Tokens | Purpose |
|---|---|---:|---|
| `l0` | `micro-117k` | one batch | primitive, gradient, and overfit fixture on Mac |
| `l1` | `debug-2m` | 1M | complete local pipeline and resume smoke |
| `l2a-l2c` | `scale-11m` / `small-28m-mha` / `elenkhos-70m-lab` | 2,789,067 / 784,562 / 274,483 before batch rounding | one-profile local A3 harness rehearsal; no scaling claim |
| `s1-s9` | `scale-11m` / `small-28m-mha` / `elenkhos-70m-lab` | exact table in Section 3 | three-budget A3 study; third budget held out |
| `r1-r3` | `small-28m-mha` | 5M each | bounded learning-rate rejection pilot |
| `r4-r5` | `small-28m-mha/gqa` | 50M each | MHA/GQA ablation |
| `r6-r7` | `small-25m-gqa` | 50M each | web/domain-mixture ablation |
| `r8` | `elenkhos-70m-lab` | 300M default | final systems checkpoint |

This is approximately 742M training-token passes across all required runs,
including the 300M final run. The previous 500M stretch and 100M-per-ablation
plan is removed because it added compute without adding a distinct claim.

### 9.3 S1: Cloud Systems Qualification

After S0 passes, run the CS336 A2-style benchmark matrix on the selected CUDA
Pod before the A3 study or final run.

| Dimension | Required values |
| --- | --- |
| models | `scale-11m`, `elenkhos-70m-lab` |
| context | `128`, `256`, `512` |
| workload | forward only; forward plus backward; full train step including optimizer |
| precision | FP32 reference and BF16 |
| attention/runtime | eager reference, SDPA, and one `torch.compile` path after parity |
| activation checkpointing | off/on for the 70M model at context 512 |
| batch | microbatch 4; lower only on measured OOM and record the deviation |
| timing | 5 warmup iterations, 10 measured iterations, explicit CUDA synchronization |
| outputs | mean, standard deviation, p50, p95, tokens/s, peak allocated/reserved VRAM |

Use random token IDs for kernel/system timing so data loading cannot contaminate
the measurement. Run a separate end-to-end input-pipeline benchmark on the
materialized shards. Never mix those two measurements.

The benchmark harness must expose:

```python
def benchmark_step(
    model: torch.nn.Module,
    input_ids: torch.Tensor,
    *,
    mode: Literal["forward", "forward_backward", "train_step"],
    warmup_steps: int = 5,
    measurement_steps: int = 10,
) -> BenchmarkResult: ...
```

Before each measured region, reset peak-memory statistics. Synchronize before
starting and after ending each timed iteration. Record PyTorch, CUDA, driver,
GPU, compiler flags, precision, attention path, and config hash. Capture Nsight
Systems traces for at least:

- `scale-11m`, BF16, context 128, full train step;
- `elenkhos-70m-lab`, BF16, context 512, full train step;
- `elenkhos-70m-lab`, BF16, context 512, full train step with the selected
  optimization.

Classify time among GEMM, attention, elementwise/norm, optimizer, memory copy,
kernel-launch gaps, and synchronization. The report must justify the selected
optimization from trace evidence, not only from a faster aggregate number.

### 9.4 S2: Cloud Scaling, Ablations, and Final Pretraining

Only after S1 passes should the paid experiment sequence run:

1. 5M-token hardware pilots to choose the Pod by measured dollars per 100M
   tokens and at least 20% VRAM headroom.
2. Nine A3 runs with the third compute budget held out from the fit.
3. Three 5M-token learning-rate rejection pilots.
4. The 50M MHA/GQA and web/domain-mixture controlled ablations.
5. The 300M-token `Elenkhos-70M-Lab` final run.

The only permitted changes between a controlled pair are the named independent
variable and parameter-count consequences that are reported explicitly. Use
the same tokenizer, split, seed policy, evaluation tokens, optimizer family,
and run-card schema.

### Compute Selection and Stop Rule

Do not choose a GPU from theoretical FLOPs alone. On each candidate GPU, run a
5M-token representative benchmark after compilation warmup and measure
steady-state tokens/second and peak VRAM.

```text
projected_gpu_hours =
  target_training_tokens / measured_steady_tokens_per_second / 3600 * 1.20

projected_gpu_cost =
  projected_gpu_hours * current_hourly_price
```

The 20% factor covers evaluation, checkpointing, startup, and variance.
Compare candidate GPUs by dollars per 100M tokens, not hourly price. A 24GB
RTX 4090/3090/A5000-class Pod is sufficient; pick the one with the lowest
measured projected cost while retaining at least 20% VRAM headroom. The Mac
runs `l0-l2c`; use Colab only for disposable smoke. Runpod begins with the
measured 5M-token benchmark after the local promotion gate.

Before `r8`, require:

- uninterrupted checkpoint-resume verification;
- declining held-out loss through the 50M-token ablation;
- projected final runtime at most 20 GPU-hours;
- projected total pretraining GPU cost at most USD 50 at launch-time prices;
- at least 15GB free persistent storage.

If any gate fails, ship the best 100M-token checkpoint and the measured
constraint rather than silently reducing evaluation or reliability work.

> [!note] $1000 budget context
> At launch-time prices (Section 5.2), 20 GPU-hours on a 24GB Pod costs well
> under USD 50 -- the realistic `r8` spend is closer to USD 10-15. The raised
> ceiling does not relax the GPU-hour or VRAM-headroom gates; it only avoids
> a false stop on dollars when the binding constraint is the 12-week
> schedule. If the 50M-token ablation's held-out loss trend still projects
> gains, the raised ceiling supports an optional `r8` extension toward
> 500M tokens, provided the 20-hour gate still holds.

### Profiling Assignment

Benchmark eager FP32, mixed precision, SDPA, and one compile/fused path after
correctness is established.

Also benchmark activation checkpointing off/on. Before profiling, write a
memory model separating parameters, gradients, optimizer state, activations,
temporary attention tensors, allocator reserve, and CUDA context. The Nsight
report must classify the selected step as compute-, memory-bandwidth-, launch-,
input-, or synchronization-bound and connect that classification to the GPU
memory hierarchy.

Measure:

- tokens/second;
- step-time distribution;
- peak allocated and reserved memory;
- time in data loading, attention, MLP, optimizer, and synchronization;
- compile warmup cost;
- checkpoint write and resume time.

The report must include one optimization that failed or was neutral.

### DDP Boundary

The only distributed experiment is a one-node, 1-vs-2 GPU comparison:

- identical global batch and token budget;
- deterministic per-rank sharding;
- rank-zero checkpoints;
- correctness check against the single-GPU loss;
- scaling efficiency and communication fraction.

Before running it, read the
[Ultrascale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook?section=first_optimization:_overlap_gradient_synchronization_with_backward_pass)
"First Optimization: Overlap Gradient Synchronization with Backward Pass" and
"Data Parallelism" sections. Use them only to (a) name the bucketed
gradient-bucket overlap mechanism PyTorch DDP already implements when
explaining the measured communication fraction, and (b) frame why ZeRO/FSDP
sharding is unnecessary at this 1-vs-2 GPU, single-node scale. Do not implement
the playbook's multi-node 3D-parallelism techniques.

Do not implement FSDP, ZeRO, or multi-node training before September.

## 10. Part D: `ElenkhosBench` Data

### Research Question

Can a 1.7B model learn to ask the smallest decision-changing question, expose
hidden assumptions, reconstruct an argument, and identify a fallacy without
becoming verbose or refusing to answer sufficiently specified problems?

### Output Schemas

#### Socratic State

```json
{
  "known": ["..."],
  "assumptions": ["..."],
  "missing": ["..."],
  "action": "ASK",
  "question": "...",
  "question_budget_remaining": 2
}
```

Allowed actions:

`ASK`, `DECOMPOSE`, `VERIFY`, `ANSWER`, `ABSTAIN`.

#### Argument Reconstruction

```json
{
  "premises": ["P1", "P2"],
  "conclusion": "C",
  "hidden_assumptions": ["A1"],
  "validity": "valid|invalid|underdetermined"
}
```

#### Dialectic

```json
{
  "thesis": "...",
  "strongest_objection": "...",
  "reply": "...",
  "remaining_disagreement": "..."
}
```

#### Fallacy

```json
{
  "label": "straw_man|ad_hominem|false_dilemma|...",
  "span": "...",
  "justification": "...",
  "minimal_repair": "..."
}
```

### Accepted Training Set: Staged 2K → 4K → 8K Cap

The 8K number is a ceiling, not a mandatory vanity target. Train a 2K pilot,
then 4K, and proceed to 8K only if the 4K run improves the pre-registered
primary metric by at least two absolute points over 2K without hurting the
correctness floor.

| Behavior | 8K-cap allocation | Exact source recipe |
|---|---:|---|
| Socratic hidden-premise questioning | 2,400 | 1,200 transformations of [`openai/gsm8k`](https://huggingface.co/datasets/openai/gsm8k) plus 1,200 project-generated ML-systems diagnosis tasks |
| argument reconstruction | 2,000 | 1,000 public-domain philosophy passages plus 1,000 solver-backed propositional argument templates |
| dialectical objection/reply | 1,600 | 800 public-domain philosophical theses plus 800 training/serving design-tradeoff cases from this project |
| fallacy detection and repair | 2,000 | 1,000 licensed examples/minimal pairs from [`Navy0067/contrastive-pairs-for-logical-fallacy`](https://huggingface.co/datasets/Navy0067/contrastive-pairs-for-logical-fallacy) plus 1,000 project-generated controlled pairs |

The user-specific differentiator is the 2,000-example systems-reasoning slice:
the model must ask useful questions about data lineage, shape mismatches,
learning-rate divergence, checkpoint corruption, queue overload, KV-memory
pressure, latency regressions, and release qualification. These cases connect
the model directly to the training and serving systems being built.

### Generation Protocol

1. Create a source item with hidden state and verifier.
2. On 200 source items, compare `Qwen3-32B-AWQ` on 48GB and
   `Qwen3-14B-AWQ` on 24GB using
   schema-valid rate, verifier pass rate, tokens per accepted example, cost,
   and human preference. Use 14B when verified acceptance is within five
   absolute points of 32B.
3. Ask for one candidate first. Retry a failed source item at most twice using
   the documented thinking-mode sampling profile.
4. Discard raw `<think>` content. Parse only the final structured answer; do
   not train hidden chain-of-thought or carry it into later conversation turns.
5. Run deterministic checks.
6. Score against the human-authored rubric.
7. Retain one candidate only if all hard gates pass.
8. Generate one or two targeted negatives from a named corruption operator.

After the pilot, calculate:

```text
required_teacher_candidates =
  ceil(target_accepted_examples / pilot_acceptance_rate * 1.10)

projected_teacher_gpu_hours =
  required_candidates * pilot_mean_generated_tokens /
  measured_aggregate_generation_tokens_per_second / 3600 * 1.20
```

Do not launch the next data stage if the projected cost exceeds the recorded
budget. Save accepted structured outputs, verifier results, and compact
metadata; do not retain raw hidden reasoning. Budget less than 1GB for the
entire staged trajectory/preference dataset and evaluation fixtures.

Negative operators:

- answer before a decision-changing fact is known;
- ask an irrelevant or redundant question;
- leak the hidden answer in the question;
- invent an unsupported assumption;
- continue questioning after sufficient information;
- misidentify premise or conclusion;
- produce a weak objection;
- mislabel the fallacy;
- give a valid label with an invalid justification.

### Split Rule

Use 80/10/10 train/validation/test, grouped by:

- original document;
- GSM8K problem family;
- generator template family;
- fallacy template;
- project incident template.

No template family may span train and test.

### External Evaluation Only

- [`yale-nlp/FOLIO`](https://huggingface.co/datasets/yale-nlp/FOLIO), MIT:
  logical validity; never train on it.
- [`taisazero/socratic-debugging-benchmark`](https://huggingface.co/datasets/taisazero/socratic-debugging-benchmark),
  MIT: external Socratic debugging check; never train on it.
- a manually reviewed 200-item `ElenkhosBench-Human` set, 50 per behavior.

## 11. Part E: Distillation and Preference Optimization

### Exact Student Architecture

`Qwen3-1.7B`:

- decoder-only `Qwen3ForCausalLM`;
- 28 layers;
- hidden size 2,048;
- intermediate size 6,144;
- 16 query heads;
- 8 KV heads;
- head dimension 128;
- vocabulary 151,936;
- tied embeddings;
- configured maximum positions 40,960 and RoPE theta 1,000,000 in the pinned
  model config;
- project training/evaluation sequence length capped at 2,048.

### Baselines

1. untouched `Qwen3-1.7B`, non-thinking;
2. untouched `Qwen3-1.7B`, native thinking;
3. prompt-only Socratic policy, non-thinking, no weight update;
4. answer-only LoRA SFT on the same source tasks;
5. structured-trajectory LoRA SFT;
6. trajectory-quality DPO initialized from candidate 5.

The controlled policy runs use `enable_thinking=False`. Native thinking is a
required baseline, not mixed into the SFT target. This separates the benefit of
Elenkhos's explicit question policy from Qwen3's existing reasoning mode.

### SFT Recipe

| Setting | Value |
|---|---|
| method | QLoRA with TRL/PEFT on the one pinned Runpod CUDA GPU; Colab and local Mac runs are smoke tests only |
| target modules | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| rank | 32 |
| alpha | 64 |
| dropout | 0.05 |
| max length | 2,048 |
| loss | completion/assistant tokens only |
| initial micro/effective batch | micro-batch 2, gradient accumulation 32, effective batch 64; adjust only after measured peak-memory and throughput results |
| learning-rate sweep | `5e-5`, `1e-4`, `2e-4` on a 10% subset |
| epochs | maximum 2; early stop on validation behavior metrics |
| packing | compare off versus on in one short throughput experiment |

Use TRL `SFTTrainer` or an equivalent explicit loop. The report must explain
the dataset format, chat template, EOS handling, response mask, packing, and
adapter configuration.

### DPO Recipe

| Setting | Value |
|---|---|
| initialization | best trajectory-SFT adapter |
| preference data | 4,000 hard-case pairs default; 8,000 maximum |
| beta sweep | `0.1`, `0.2` |
| learning rate | `5e-6` default; one bounded alternative |
| epochs | 1 |
| max prompt length | 1,024 |
| max completion length | 1,024 |
| selection metric | validation policy score with correctness floor |

Run DPO on the 24GB Pod first. Use micro-batch 1, gradient accumulation 64,
gradient checkpointing, a materialized Arrow dataset, and
`precompute_ref_log_probs=True`; these settings keep DPO within 24GB. Move to a
48GB Pod only on measured OOM, insufficient VRAM headroom, or a lower projected
total cost, and record the measured reason. Do not shorten the frozen
evaluation context to make the run fit.
Pin TRL to the version used by the run and record it in the release manifest.

Stop DPO if:

- final-answer correctness falls by more than two absolute points;
- mean questions exceed the configured budget;
- leakage or redundant-question rate worsens;
- the model learns to ask a question on already specified tasks.

### Primary Metrics

| Metric | Desired direction |
|---|---|
| final-answer correctness | up or no material regression |
| required-slot recall (`required hidden slots asked before answering / total required slots`) | up |
| question precision (`questions tied to required slots / all questions`) | up |
| premature-answer rate | down |
| irrelevant-question rate | down |
| answer leakage | down |
| mean questions before answer | bounded, not maximized |
| correctly immediate-answer rate | up |
| argument reconstruction exact/F1 | up |
| fallacy macro-F1 | up |
| dialectic rubric score | up with judge agreement reported |

### Required Ablation

The central table is:

`base non-thinking vs base thinking vs prompt-only vs answer-only SFT vs
trajectory SFT vs DPO`.

Without that table, the project cannot claim that distillation added value.

### Numerical and Data-Quality Gates

- inspect and label 100 randomly sampled accepted SFT examples;
- reject a batch when completion masks contain zero assistant tokens;
- compare project sequence log probabilities and DPO loss against a
  hand-calculated two-example fixture and TRL within `1e-5`;
- report packing efficiency and verify no cross-example attention leakage;
- run three seeds for the selected 10% SFT configuration before the full run;
- evaluate every checkpoint with a frozen prompt/parser version;
- publish parse failures rather than silently retrying them away;
- run the 100-case policy red-team set before promoting SFT or DPO.

### Exact Evaluation Definitions

Freeze prompt, chat template, thinking mode, sampler, parser version, test-set
hashes, and question budget before candidate comparison.

```text
required_slot_recall =
  required hidden slots correctly targeted before answer / all required slots

question_precision =
  decision-relevant questions / all questions asked

premature_answer_rate =
  answers emitted with unresolved required slots / all answer cases

redundancy_rate =
  repeated already-resolved slot questions / all questions asked

leakage_rate =
  questions containing protected answer facts / all questions asked

correct_immediate_answer_rate =
  correct no-question answers on fully specified items / fully specified items
```

Report per-source macro averages and paired bootstrap 95% confidence intervals.
Do not let high-volume synthetic templates dominate the 200-item human set.
Double-score at least 50 subjective dialectic items and publish agreement,
adjudication rules, and representative disagreements.

### Interactive `ElenkhosEnv`

Add one small environment-based evaluation inspired by the principle that
agents should be tested through interaction, not only static prompts. This is
not a world-model or embodied-AI project. It is a deterministic state machine
for the exact Elenkhos research question.

```python
obs = env.reset(seed)
obs, reward_components, done, info = env.step(action)
```

Each of 50 frozen episodes contains:

- a visible problem statement;
- hidden required slots whose values must be requested before a correct answer;
- irrelevant slots that should not be requested;
- optional contradictions or already-specified facts;
- typed `ask(slot)` and `answer(value)` actions;
- deterministic reveals and a complete event log.

Score terminal correctness, required-slot recall, question precision, repeated
or irrelevant questions, premature answers, total question cost, and steps to
completion. Include underspecified, fully specified, contradictory, and
irrelevant-detail episodes. Replay every seed twice and require byte-identical
transition logs. The environment becomes an evaluation and regression artifact;
do not expand it into browser automation, robotics, or an RL training platform.

Expose the same contract through a thin `clients/elenkhos_agent.py` application
client after ElenkhosServe is operational. The client accepts only typed
`ask(slot)` and `answer(value)` actions, calls the deterministic environment,
appends observations to the model context, enforces the max-turn and question
budgets, and writes a replayable session trace. This is the bounded application
proof for AI-software roles. It must not depend on LangChain, LlamaIndex, a
vector database, or a second agent: the orchestration and its failure behavior
should remain visible in roughly one inspectable module.

## 12. Part F: `ElenkhosServe`

### Purpose

Qualify model releases, not reimplement inference kernels.

### Runtime Boundary

Own:

- C++ request lifecycle;
- bounded queue;
- cancellation and deadlines;
- token-aware admission;
- release manifests;
- quality and SLO gates;
- shadow/canary state machine;
- rollback;
- metrics and fault injection.

Delegate and attribute:

- model execution and KV storage to llama.cpp;
- low-level quantization kernels to llama.cpp;
- comparison serving to vLLM;
- tensor kernels to the selected runtime.

`llama.cpp` remains the sole backend integrated into the C++ service. Do not
add a second local runtime merely for keyword coverage: it would consume time
without strengthening the owned C++ lifecycle, concurrency, scheduling,
admission, application protocol, and rollback proof.

### Reference-to-Service Sequence

Apply the `llama2.c` philosophy to lifecycle clarity, not to kernel
reimplementation:

1. implement `src/reference/synchronous_request.cc`, a single-threaded path
   that loads one manifest/model, executes one deterministic request, records
   token IDs/text/timings, and releases all state;
2. wrap the same pinned llama.cpp backend in a narrow RAII `Engine`;
3. require deterministic token/output parity between the reference path and
   the engine adapter;
4. add streaming and cancellation;
5. add the bounded queue, scheduler, admission, and release state machine;
6. retain the synchronous path as a debug oracle and qualification fixture.

The reference file should remain inspectable without following the HTTP,
scheduler, or rollout code. The production path may be modular, but each added
layer must have a separate test and a measured reason to exist.

### Model Sequence

1. bootstrap service development with a small supported GGUF model;
2. serve untouched `Qwen3-1.7B`;
3. merge/export `Elenkhos-1.7B-SFT`;
4. qualify `Elenkhos-1.7B-DPO`;
5. compare `Q8_0` and `Q4_K_M`;
6. establish correctness and throughput baselines on the selected Runpod CUDA
   environment, then optimize and qualify the same releases for the target
   MacBook Pro M4 16GB llama.cpp/Metal profile.

### Release ID Format

```text
elenkhos-1.7b-{base|sft|dpo}-{fp16|q8_0|q4_k_m}-rNN
```

### Required Gates

| Gate | Example failure |
|---|---|
| integrity | model or tokenizer checksum mismatch |
| compatibility | unsupported architecture/runtime revision |
| reasoning quality | required-slot recall or question-precision regression |
| answer quality | correctness floor violated |
| policy quality | premature-answer, leakage, or redundant-question regression |
| latency | p99 or TTFT budget violated |
| goodput | insufficient SLO-compliant throughput |
| memory | constrained profile does not fit |
| reliability | timeout, cancellation, readiness, or overload failure |

### Required Benchmarks

Compare:

1. stock llama.cpp server;
2. `ElenkhosServe` with FIFO and admission disabled;
3. `ElenkhosServe` with token-aware admission enabled;
4. vLLM on the selected Runpod CUDA GPU as the cloud baseline;
5. `Q8_0` versus `Q4_K_M`;
6. untouched, SFT, and DPO releases;
7. the same frozen `ElenkhosAgent` sessions under direct, overload, timeout,
   blocked-release, and rollback conditions.

Measure TTFT, TPOT, p50/p95/p99 latency, request throughput, output-token
throughput, peak memory, error/rejection rate, and goodput.

Use the same seeded traces for every release:

- `short`: 128-512 prompt tokens and 32-128 output tokens;
- `mixed`: 128-2,048 prompt tokens and 32-512 output tokens;
- `overload`: the mixed trace replayed at increasing arrival rates.

For each configuration, exclude 10 warmup requests, run at least three trials,
publish raw request/token event JSONL, and report paired confidence intervals.
Pre-register SLOs using the untouched base release before evaluating SFT/DPO or
quantized candidates.

```text
TTFT = first_token_time - request_arrival_time
TPOT = (completion_time - first_token_time) / max(output_tokens - 1, 1)
goodput = requests meeting every configured SLO / wall-clock second
```

Do not compare cloud CUDA and M4 throughput as a controlled hardware
experiment. CUDA is a runtime reference; the M4 is the deployment target.

### Required Failure Campaign

- corrupt checkpoint checksum;
- tokenizer revision mismatch;
- seeded `ElenkhosBench` regression;
- timeout storm;
- queue overload;
- constrained-profile memory pressure;
- model-load failure.

Ship one blocked-release report and one automatic canary-rollback report.

### Mac M4 Optimization Target

The final inference claim is not “runs somewhere.” It is:

- `Elenkhos-1.7B-{SFT|DPO}` exported to GGUF;
- `Q8_0` and `Q4_K_M` measured on the 16GB MacBook Pro M4;
- context-length and concurrency limits chosen from observed unified-memory
  pressure;
- llama.cpp Metal as the execution backend;
- ElenkhosServe admission control preventing requests that would violate the
  memory or p99 budget;
- the bounded ElenkhosAgent application trace completing within the measured
  latency, memory, question, and reliability budgets;
- cloud CUDA results retained as a correctness/performance reference, not the
  deployment target.

The report must state which optimizations are portable control-plane work and
which are specific to Metal, llama.cpp, quantization, or the M4 memory budget.

## 13. Part G: Reports and Resume Proof

Required reports:

1. `data-report.md`
2. `tokenizer-ablation.md`
3. `architecture-and-accounting.md`
4. `training-profile.md`
5. `distillation-evaluation.md`
6. `serving-benchmark.md`
7. `blocked-release.md`
8. `canary-rollback.md`
9. `limitations-and-failed-experiments.md`

Every result table must identify:

- config file;
- code revision;
- data/model revision;
- random seed;
- hardware;
- runtime version;
- measured sample count;
- uncertainty or run-to-run variance where practical.

### Resume Claim Gate

Do not claim a keyword until the matching artifact exists.

| Claim | Minimum evidence |
|---|---|
| data curation | source manifest, stage yields, dedup and contamination report |
| LLM from scratch | tested tokenizer, decoder, optimizer, checkpoint, and final run |
| reasoning distillation | controlled baseline table and verified dataset |
| DPO | preference schema, beta comparison, and held-out policy metrics |
| C++ inference | reproducible CMake service using the final model |
| scheduling/admission | owned implementation plus load-test comparison |
| quantization | Q8/Q4 quality-memory-latency table |
| release reliability | blocked release and rollback evidence |
| agent/application engineering | typed ask/observe/answer client, frozen environment, replayable traces, budget and failure tests |
| distributed training | actual 1-vs-2 GPU result, not a design paragraph |

### Portfolio and Resume Packaging

Treat Elenkhos as one capstone with three selectable modules, not three unrelated
AI projects:

1. `elenkhos-train`: data, from-scratch 70M baseline, verified distillation,
   QLoRA SFT/DPO, and evaluation;
2. `elenkhos-serve`: GGUF export, C++ llama.cpp service, scheduling, admission,
   qualification, and rollback;
3. `ElenkhosAgent`: the thin typed ask/observe/answer client over ElenkhosEnv.

Maintain two base one-page resumes:

| Resume | Experience | Projects | Project selection |
|---|---:|---:|---|
| AI / MLE / AI-software | 40-45% | 30-35% | one combined Elenkhos capstone entry with 3-4 role-selected bullets, plus the measured Jetson/TensorRT project; add the application-loop bullet for AI-software/applied roles and the serving/profiling bullets for ML-systems roles |
| General SWE / backend | 55-60% | 15-20% | preserve AWS and Salk depth; include ElenkhosServe as one systems project with API, C++, concurrency, reliability, and measured SLO bullets; omit training detail unless the posting requests ML |

Education and skills consume the remaining space. Do not reduce the AWS, Salk,
or measured Jetson/TensorRT evidence merely to display all three Elenkhos
modules. A recruiter should see at most two project entries on either base
resume. During interviews, prepare one two-minute capstone overview and choose
one primary deep dive by role; the other modules are integration evidence, not
three equally weighted stories.

## 14. Primary Resources and Exact Sections

### Data

1. [CS336 A4 Data PDF](https://github.com/stanford-cs336/assignment4-data/blob/main/cs336_assignment4_data.pdf):
   Sections 2.1-2.7, 3.1-3.2, and 4.
2. [FineWeb technical blog](https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1):
   "Ablations and evaluation setup", "The FineWeb recipe", "Deduplicating the
   data", "Additional quality filtering", and "FineWeb-Edu".
3. [MLSys Data Engineering](https://mlsysbook.ai/vol1/contents/vol1/data_engineering/data_engineering.html):
   provenance, data quality, and pipeline framing.

### Model and Pretraining

1. [CS336 A1 Basics PDF](https://github.com/stanford-cs336/assignment1-basics/blob/main/cs336_assignment1_basics.pdf):
   Sections 2-7, selecting the required problems listed in Section 3 above.
2. [CS336 A2 Systems PDF](https://github.com/stanford-cs336/assignment2-systems/blob/main/cs336_assignment2_systems.pdf):
   Sections 2, 3, selected 4.1-4.2, and selected 5.
3. [CS336 A3 Scaling PDF](https://github.com/stanford-cs336/assignment3-scaling/blob/main/cs336_assignment3_scaling.pdf):
   Sections 2 and 3.
4. [Smol Training Playbook](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook):
   "Every Big Model Starts with a Small Ablation", "Ablation Setup",
   "Designing the Model Architecture", "Optimizer and Training
   Hyperparameters", "Scaling Laws", "The Art of Data Curation", "Preflight
   Checklist", "Training Monitoring", and "Checkpoint Management".
5. [GPU Mode Lecture 1](https://github.com/gpu-mode/lectures/tree/main/lecture_001):
   profiler workflow, timing discipline, and bottleneck attribution.
6. [GPU Mode Lecture 8](https://github.com/gpu-mode/lectures/tree/main/lecture_008):
   CUDA performance checklist, memory hierarchy, and roofline reasoning.
7. [Ultrascale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook?section=first_optimization:_overlap_gradient_synchronization_with_backward_pass):
   "Data Parallelism" and "First Optimization: Overlap Gradient
   Synchronization with Backward Pass" only, for the Section 9 DDP Boundary
   report. The rest of the playbook (tensor/pipeline/context parallelism,
   ZeRO, multi-node 3D parallelism) is out of scope for this project.

### Post-Training

1. [CS336 A5 Alignment PDF](https://github.com/stanford-cs336/assignment5-alignment/blob/main/cs336_spring2026_assignment5_alignment.pdf):
   prompting baselines and response/log-prob/reward interfaces; GRPO is
   reserve-only.
2. [CS336 A5 Safety/RLHF supplement](https://github.com/stanford-cs336/assignment5-alignment/blob/main/cs336_spring2026_assignment5_supplement_safety_rlhf.pdf):
   Sections 3-6 for baseline evaluation, packed SFT, response-only loss, DPO,
   and post-training error analysis.
3. [TRL 1.6.0 SFTTrainer](https://huggingface.co/docs/trl/v1.6.0/en/sft_trainer):
   dataset formats, completion/assistant-only loss, packing, PEFT, and logged
   metrics.
4. [TRL 1.6.0 DPOTrainer](https://huggingface.co/docs/trl/v1.6.0/en/dpo_trainer):
   preference formats, loss configuration, PEFT integration, and metrics.
5. [PEFT 0.19.0 LoRA guide](https://huggingface.co/docs/peft/v0.19.0/en/developer_guides/lora):
   target modules, initialization, memory tradeoffs, and adapter merge.
6. [Smol Training Playbook](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook):
   "Evals Before Everything Else", "Why Every Post-Training Pipeline Starts
   with SFT", "Targeting Specific Capabilities", "From SFT to Preference
   Optimization", and "Which Hyperparameters Matter".

### Serving and Reliability

1. [StudyPlan Build Process](https://www.studyplan.dev/pro-cpp/build-process),
   [Smart Pointers](https://www.studyplan.dev/pro-cpp/smart-pointers), and
   [Move Semantics](https://www.studyplan.dev/pro-cpp/move-semantics):
   CMake/build, RAII, ownership, and zero-copy transfer boundaries.
2. [OSTEP Chapters 26-32](https://pages.cs.wisc.edu/~remzi/OSTEP/):
   concurrency, threads, locks, condition variables, semaphores, and common
   concurrency bugs for the queue and cancellation state machine.
3. [AIEFS continuous batching](https://aiengineeringfromscratch.com/lesson.html?path=phases/17-infrastructure-and-production/05-continuous-batching)
4. [AIEFS inference metrics and goodput](https://aiengineeringfromscratch.com/lesson.html?path=phases/17-infrastructure-and-production/08-inference-metrics-goodput)
5. [AIEFS shadow/canary rollout](https://aiengineeringfromscratch.com/lesson.html?path=phases/17-infrastructure-and-production/20-shadow-canary-progressive)
6. [AIEFS load testing](https://aiengineeringfromscratch.com/lesson.html?path=phases/17-infrastructure-and-production/22-load-testing-llm-apis)
7. [MLSys Model Serving](https://mlsysbook.ai/vol1/contents/vol1/model_serving/model_serving.html)
8. [MLSys Fault Tolerance](https://mlsysbook.ai/vol2/contents/vol2/fault_tolerance/fault_tolerance.html)
9. [MLSys Performance Engineering](https://mlsysbook.ai/vol2/contents/vol2/performance_engineering/performance_engineering.html)

### Official Implementation References

These are operational documentation, not additional active courses:

- [llama.cpp repository and build documentation](https://github.com/ggml-org/llama.cpp);
- [llama.cpp server documentation](https://github.com/ggml-org/llama.cpp/tree/master/tools/server);
- [vLLM serving documentation](https://docs.vllm.ai/en/latest/serving/openai_compatible_server/);
- [vLLM benchmark documentation](https://docs.vllm.ai/en/latest/benchmarking/cli/);
- [Qwen3-1.7B model card](https://huggingface.co/Qwen/Qwen3-1.7B);
- [Qwen3-32B-AWQ model card](https://huggingface.co/Qwen/Qwen3-32B-AWQ);
- [Qwen3-14B-AWQ model card](https://huggingface.co/Qwen/Qwen3-14B-AWQ);
- [Hugging Face Datasets streaming guide](https://huggingface.co/docs/datasets/stream);
- [Common Crawl index and data-access documentation](https://commoncrawl.org/get-started).
- [Runpod GPU and storage pricing](https://www.runpod.io/pricing);
- [Runpod storage types](https://docs.runpod.io/pods/storage/types).

Use exact revisions in manifests. Documentation URLs can move; store retrieval
dates and the behavior/config relied upon.

### Primary-Source Further Reading Map

These papers and official docs answer implementation questions after the
assigned CS336/resource section. They are not a second linear curriculum.

#### Architecture and Training

| Source | Use it for |
|---|---|
| [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | decoder attention and residual architecture origin |
| [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467) | RMSNorm definition and invariance |
| [RoFormer](https://arxiv.org/abs/2104.09864) | rotary position embedding derivation |
| [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202) | SwiGLU motivation |
| [GQA: Training Generalized Multi-Query Transformer Models](https://arxiv.org/abs/2305.13245) | MHA-to-GQA quality and KV-cache tradeoff |
| [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556) | compute/token/model-size framing and limits of the A3 adaptation |
| [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101) | AdamW update definition |
| [Training Deep Nets with Sublinear Memory Cost](https://arxiv.org/abs/1604.06174) | activation checkpointing tradeoff |
| [Mixed Precision Training](https://arxiv.org/abs/1710.03740) | precision, accumulation, and loss-scaling background |
| [FlashAttention](https://arxiv.org/abs/2205.14135) | IO-aware attention and memory-hierarchy reasoning |
| [PyTorch SDPA](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html), [activation checkpointing](https://docs.pytorch.org/docs/stable/checkpoint.html), [profiler](https://docs.pytorch.org/docs/stable/profiler.html), and [DDP](https://docs.pytorch.org/docs/stable/generated/torch.nn.parallel.DistributedDataParallel.html) | exact framework behavior used by the implementation |
| [Ultrascale Playbook: Data Parallelism](https://huggingface.co/spaces/nanotron/ultrascale-playbook?section=first_optimization:_overlap_gradient_synchronization_with_backward_pass) | naming the gradient-bucket overlap mechanism behind PyTorch DDP's measured communication fraction in the Section 9 DDP Boundary report |

#### Data and Evaluation

| Source | Use it for |
|---|---|
| [FineWeb: decanting the web for the finest text data at scale](https://arxiv.org/abs/2406.17557) | filtering/dedup ablations and FineWeb methodology |
| [Scaling Language Models: Methods, Analysis & Insights from Training Gopher](https://arxiv.org/abs/2112.11446) | Gopher repetition and document-quality rules |
| [Common Crawl data access](https://commoncrawl.org/get-started) | index, WARC/WET, and bounded raw-web audit retrieval |
| [Project Gutenberg permission information](https://www.gutenberg.org/policy/permission.html) | item-level public-domain and jurisdiction caveats |
| [GSM8K](https://arxiv.org/abs/2110.14168) | source benchmark design and contamination context |
| [FOLIO](https://arxiv.org/abs/2209.00840) | natural-language first-order-logic evaluation |

#### Post-Training and Distillation

| Source | Use it for |
|---|---|
| [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388) and [Qwen3-1.7B model card](https://huggingface.co/Qwen/Qwen3-1.7B) | architecture, thinking/non-thinking behavior, and sampling contract |
| [LoRA](https://arxiv.org/abs/2106.09685) | low-rank adaptation mechanism |
| [QLoRA](https://arxiv.org/abs/2305.14314) | 4-bit adapter training and memory assumptions |
| [Direct Preference Optimization](https://arxiv.org/abs/2305.18290) | reference DPO objective and reward interpretation |
| [TRL 1.6.0 SFTTrainer](https://huggingface.co/docs/trl/v1.6.0/en/sft_trainer), [DPOTrainer](https://huggingface.co/docs/trl/v1.6.0/en/dpo_trainer), and [PEFT 0.19.0 LoRA](https://huggingface.co/docs/peft/v0.19.0/en/developer_guides/lora) | version-pinned library interfaces used by the planned configs |

#### Inference and Serving

| Source | Use it for |
|---|---|
| [vLLM/PagedAttention](https://arxiv.org/abs/2309.06180) | KV-cache paging and serving throughput |
| [Orca](https://www.usenix.org/conference/osdi22/presentation/yu) | iteration-level scheduling and continuous batching |
| [llama.cpp](https://github.com/ggml-org/llama.cpp), [server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server), and [GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md) | actual local runtime, API, model format, and build behavior |
| [vLLM OpenAI-compatible server](https://docs.vllm.ai/en/latest/serving/openai_compatible_server/), [metrics](https://docs.vllm.ai/en/latest/design/metrics/), and [benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli/) | cloud comparison interface and measurement definitions |

## 15. High-ROI Concept Coverage Audit

Coverage rule: include every signal with overall opportunity at least 35, plus
every hiring-market gate at least 50 even when Xiaohongshu is silent because
the collection focused on AI infrastructure. A concept counts only when it
maps to implemented code, a measurement, and a reviewable artifact.

| Signal | Score evidence | Problems | Required implementation and measurement | Public proof |
|---|---|---|---|---|
| LLM inference | overall 59.8 | R0-R3 | prefill/decode separation, KV-byte model, streaming, batching/admission, TTFT/TPOT/goodput | C++ service, load generator, and qualification report |
| model evaluation | 50.0 | E0, R3 | frozen golden sets, parsers, grouped splits, bootstrap intervals, regression gates | ElenkhosBench registry and one blocked release |
| training pipelines | 43.2 | D0-S2, P0-P2 | data-to-checkpoint lineage, BF16, clipping, resume, SFT/DPO, promotion gates | manifests, checkpoints, curves, and run postmortem |
| quantization | 41.9 | R0, R3 | GGUF conversion and Q8/Q4 quality-memory-latency comparison | Mac M4 parity and qualification table |
| Python | market 82.6 | D0-P2 | typed modules, adapters, CLI/config, PyTorch/HF integration, pytest | `elenkhos-train` repository and CI |
| backend APIs | 41.0 | R1-R3 | streaming HTTP, cancellation, deadlines, readiness, overload semantics | API contract, conformance suite, and fault tests |
| GPU/CUDA | 40.8 | S1-S2 | synchronization-aware timing, Nsight, BF16, SDPA/compile, activation memory | trace set, timing matrix, and optimization decision |
| LLM agents | 40.8 | E0, C0 | bounded typed ask/observe/answer loop over ElenkhosEnv; no framework-heavy wrapper | replayable traces, task success, turns, and failure taxonomy |
| performance profiling | 39.5 | S1, R2-R3 | analytical memory model, warmups, distributions, profiler attribution | training/serving profiles and estimate-vs-measure table |
| cloud infrastructure | 37.7 | S1-S2, P0-P2 | pinned Runpod image, GPU, volume, cache, budget, and teardown policy | reproducible runbook and cost ledger |
| communication | market 66.7 | all | decision records, dataset/model cards, incident report, 2/10-minute explanations | reports, diagrams, and demo script |
| distributed systems | market 65.8 | R1-R3 | bounded queues, backpressure, cancellation, failure states, canary/rollback; DDP stretch | state machine, fault campaign, and overload curves |
| C++ | market 60.2 | R1-R3 | C++20 ownership, RAII, thread safety, CMake, sanitizers | `elenkhos-serve` repository and sanitizer CI |
| DSA | market 59.9 | maintenance lane | bounded interview practice for arrays, graphs, heaps, hashing, and complexity | timed practice log; no false project claim |
| system design | market 53.0 | R1-R3 | capacity model, API/SLO, deployment boundary, failure analysis, rollback | serving design document and review checklist |
| data pipelines | market 52.9 | D0-D1 | provenance, streaming materialization, PII, filtering, dedup, tokenization, yields | A4-style pipeline, manifests, and dataset card |
| production ops | market 52.6 | R3 | observability, qualification, canary, rollback, incident response | release reports and rollback drill |
| ML fundamentals | market 51.3 | M0-S2, E0-P2 | loss, optimization, generalization, split design, ablations, preference learning | A1/A3/A5 reports and controlled result tables |
| OS/concurrency | market 50.1 | R1-R2 | threads, locks, condition variables, cancellation, shutdown, queue ownership | scheduler tests, race analysis, and sanitizer runs |
| testing/quality | market 47.3 | all | unit, parity, property, integration, resume, load, fault, and regression tests | CI matrix and final acceptance report |

Generic agent frameworks, RAG, multi-agent systems, VLMs, custom CUDA kernels,
FSDP, multi-node training, and full GRPO remain later or reserve-only. The one
bounded application client is sufficient to prove tool-state orchestration
without weakening the controlled experiment.

## 16. Final Acceptance Gate

- [ ] `Elenkhos-70M-Lab` trains reproducibly and has correctness tests.
- [ ] A1-A5 required rows in Section 3.1 each link to a test, report, or
      machine-readable artifact; written/stretch/cut rows are labeled honestly.
- [ ] The bounded A3 study contains nine runs and one third-budget held-out
      prediction.
- [ ] The A4 raw-web audit includes quality-classifier disagreement and manual
      audits, while canonical training remains FineWeb-Edu.
- [ ] The data card reports exact sources, revisions, licenses, and stage yields.
- [ ] Philosophy examples obey author/work caps, held-out-author splits,
      edition-level licensing, and human source-grounding review.
- [ ] `ElenkhosBench` has source-family splits and a human-reviewed test slice.
- [ ] The baseline table includes base non-thinking, base native-thinking,
      prompt-only, answer-only SFT, trajectory SFT, and DPO.
- [ ] The final product model is `Elenkhos-1.7B-SFT` or
      `Elenkhos-1.7B-DPO`, selected by held-out metrics rather than method name.
- [ ] `ElenkhosServe` serves the selected model in Q8 and Q4.
- [ ] One release is blocked for a quality or integrity regression.
- [ ] One canary is automatically rolled back for a measured failure.
- [ ] Every claimed resume keyword maps to a public artifact.
- [ ] The report includes at least one failed or neutral experiment.
