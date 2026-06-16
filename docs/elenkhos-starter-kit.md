---
title: Elenkhos Starter Kit
aliases:
  - Elenkhos Project Files
  - Elenkhos Starter Code
tags:
  - ai-systems
  - cs336
  - starter-code
status: active
---

# Elenkhos Starter Kit

This is the executable companion to [[elenkhos-project-spec]]. It defines the
files, commands, schemas, configuration boundaries, and test scaffolds that
should exist before expensive data generation or GPU training begins.

It intentionally does not contain completed CS336 assignment solutions.
Primitive implementations remain `TODO`; the project supplies stable
interfaces, reference tests, experiment plumbing, and system contracts.

## 1. Repository Contract

### `elenkhos-train`

```text
elenkhos-train/
  pyproject.toml
  uv.lock
  Makefile
  README.md
  LICENSE
  .python-version
  .gitignore
  .pre-commit-config.yaml
  configs/
    data/
      fixture-100k.yaml
      local-pretrain-10m.yaml
      web-50m.yaml
      domainmix-50m.yaml
      domainmix-300m.yaml
      raw-web-audit.yaml
    model/
      micro-117k.yaml
      debug-2m.yaml
      scale-11m.yaml
      small-28m-mha.yaml
      small-25m-gqa.yaml
      elenkhos-70m-lab.yaml
    train/
      debug-2m-local.yaml
      a3-local-rehearsal.yaml
      lr-sweep.yaml
      isoflops-low.yaml
      isoflops-mid.yaml
      isoflops-high.yaml
      final-70m.yaml
    posttrain/
      teacher-generation.yaml
      sft-pilot.yaml
      sft-final.yaml
      dpo-pilot.yaml
      dpo-final.yaml
    eval/
      base-thinking.yaml
      base-nonthinking.yaml
      elenkhosbench.yaml
      redteam.yaml
  schemas/
    source-manifest.schema.json
    document-record.schema.json
    trajectory.schema.json
    preference-pair.schema.json
    eval-result.schema.json
    release-manifest.schema.json
  src/elenkhos/
    __init__.py
    cli.py
    config.py
    logging.py
    provenance.py
    data/
      commoncrawl.py
      fineweb.py
      gutenberg.py
      normalize.py
      language.py
      pii.py
      harmful.py
      quality_rules.py
      quality_classifier.py
      exact_dedup.py
      minhash_dedup.py
      split.py
      tokenize.py
      manifests.py
    tokenizer/
      pretokenize.py
      bpe_train.py
      tokenizer.py
      serialization.py
    model/
      config.py
      linear.py
      embedding.py
      norm.py
      rope.py
      attention.py
      mlp.py
      block.py
      transformer.py
      generation.py
      accounting.py
    training/
      batcher.py
      loss.py
      optimizer.py
      schedule.py
      checkpoint.py
      trainer.py
      benchmark.py
      profile.py
      distributed.py
    scaling/
      run_matrix.py
      fit.py
      predict.py
    posttrain/
      schemas.py
      teacher.py
      verifiers.py
      corruptions.py
      collator.py
      logprobs.py
      dpo_reference.py
      sft.py
      dpo.py
    evaluation/
      parsers.py
      question_policy.py
      argument.py
      dialectic.py
      fallacy.py
      bootstrap.py
      contamination.py
      runner.py
    export/
      merge_adapter.py
      export_hf.py
      export_gguf.py
      release_manifest.py
  tests/
    adapters.py
    fixtures/
      unicode_cases.json
      attention_cases.pt
      dpo_two_example.json
      release_manifest.json
    data/
      test_manifest.py
      test_filters.py
      test_quality_classifier.py
      test_dedup.py
      test_split.py
    tokenizer/
      test_bpe.py
      test_tokenizer.py
    model/
      test_primitives.py
      test_attention.py
      test_transformer.py
      test_accounting.py
    training/
      test_loss.py
      test_optimizer.py
      test_schedule.py
      test_checkpoint.py
      test_resume_parity.py
      test_overfit.py
      test_benchmark.py
    scaling/
      test_run_matrix.py
      test_fit.py
    posttrain/
      test_masks.py
      test_logprobs.py
      test_dpo_reference.py
      test_verifiers.py
    evaluation/
      test_parsers.py
      test_question_policy.py
      test_contamination.py
  scripts/
    bootstrap.sh
    materialize_data.py
    tokenize_data.py
    check_resume_parity.py
    run_a3_matrix.py
    benchmark_training.py
    profile_training.py
    build_raw_web_audit.py
    build_elenkhosbench.py
    generate_teacher_candidates.py
    train_sft.py
    train_dpo.py
    run_eval.py
    export_release.py
  runs/
    local_prescale.sh
    cloud_systems.sh
    cloud_scaling.sh
    posttrain.sh
    qualify_release.sh
  examples/
    tokenizer_roundtrip.py
    one_batch_overfit.py
    synchronous_generate.py
  reports/
  artifacts/
    manifests/
    tokenizers/
    checkpoints/
    eval/
  dataset-card.md
  model-card.md
```

### `elenkhos-serve`

```text
elenkhos-serve/
  CMakeLists.txt
  CMakePresets.json
  vcpkg.json
  Makefile
  README.md
  LICENSE
  Dockerfile
  cmake/
    Sanitizers.cmake
    Warnings.cmake
  include/elenkhos/
    engine/engine.h
    engine/llama_engine.h
    service/http_server.h
    service/request.h
    service/response.h
    scheduler/bounded_queue.h
    scheduler/scheduler.h
    admission/capacity_model.h
    admission/admission_controller.h
    release/manifest.h
    release/qualification_gate.h
    release/state_machine.h
    metrics/metrics.h
  src/
    main.cc
    reference/synchronous_request.cc
    engine/llama_engine.cc
    service/http_server.cc
    scheduler/bounded_queue.cc
    scheduler/scheduler.cc
    admission/capacity_model.cc
    admission/admission_controller.cc
    release/manifest.cc
    release/qualification_gate.cc
    release/state_machine.cc
    metrics/metrics.cc
  tests/
    CMakeLists.txt
    engine_test.cc
    bounded_queue_test.cc
    scheduler_test.cc
    admission_test.cc
    release_manifest_test.cc
    qualification_gate_test.cc
    release_state_machine_test.cc
    shutdown_test.cc
  bench/
    loadgen.py
    traces/
      short.jsonl
      mixed.jsonl
      overload.jsonl
    analyze.py
    compare.py
  clients/
    smoke.py
    stream.py
    cancel.py
  configs/
    local-m4.yaml
    cloud-cuda.yaml
    slo.yaml
  releases/
    manifests/
    qualification/
    incidents/
  reports/
```

The `runs/` scripts are the nanochat-style canonical path through the
capstone. They should remain short orchestration files whose commands can be
run individually. Do not hide the workflow inside a generic DAG engine.

The `examples/` and `src/reference/` paths are the minGPT/llm.c/llama2.c-style
readable paths. Optimized paths may replace them in canonical scale runs only
after parity tests pass; reference paths remain available for debugging.

## 2. File-to-Assignment Mapping

| CS336 area | Primary project files |
|---|---|
| A1 tokenizer | `data/tokenize.py`, `tokenizer/*`, `tests/tokenizer/*` |
| A1 model | `model/linear.py` through `model/transformer.py`, `tests/model/*` |
| A1 optimizer/training | `training/loss.py`, `optimizer.py`, `schedule.py`, `trainer.py` |
| A1 checkpoint/generation | `training/checkpoint.py`, `model/generation.py` |
| A2 benchmark/profile | `training/benchmark.py`, `profile.py`, `reports/training-profile.md` |
| A2 checkpointing/compile | `model/transformer.py`, `training/trainer.py`, config flags |
| A2 DDP stretch | `training/distributed.py`, `tests/training/test_checkpoint.py` |
| A3 scaling | `scaling/*`, `configs/train/isoflops-*.yaml` |
| A4 data | `data/*`, `schemas/source-manifest.schema.json`, data tests |
| A5 SFT/DPO | `posttrain/*`, post-training configs and tests |
| evaluation | `evaluation/*`, `schemas/eval-result.schema.json` |
| serving | all `elenkhos-serve` engine, scheduler, admission, release, and metrics files |

## 3. Bootstrap Commands

Run these before implementing model code:

```bash
# elenkhos-train
uv sync
uv run pytest -q
uv run ruff check .
uv run mypy src

# elenkhos-serve
cmake --preset debug
cmake --build --preset debug -j
ctest --preset debug --output-on-failure
```

Recommended Make targets:

```makefile
.PHONY: test lint smoke data-audit train-pilot eval export

test:
	uv run pytest -q

lint:
	uv run ruff check .
	uv run mypy src

smoke:
	uv run python -m elenkhos.cli train \
	  --config configs/train/debug-2m-local.yaml

data-audit:
	uv run python scripts/build_raw_web_audit.py \
	  --config configs/data/raw-web-audit.yaml

train-pilot:
	uv run python -m elenkhos.cli train \
	  --config configs/train/lr-sweep.yaml

eval:
	uv run python scripts/run_eval.py \
	  --config configs/eval/elenkhosbench.yaml

export:
	uv run python scripts/export_release.py \
	  --config configs/posttrain/dpo-final.yaml
```

The first commit should have passing formatting/config/schema tests and failing
`NotImplementedError` primitive tests, matching the CS336 adapter workflow.

### Runpod Workspace

Use the persistent `/workspace` mount:

```bash
export ELENKHOS_ROOT=/workspace/elenkhos
export HF_HOME=$ELENKHOS_ROOT/cache/huggingface
export HF_DATASETS_CACHE=$HF_HOME/datasets
export TRANSFORMERS_CACHE=$HF_HOME/hub
export ELENKHOS_DATA=$ELENKHOS_ROOT/data
export ELENKHOS_ARTIFACTS=$ELENKHOS_ROOT/artifacts

mkdir -p \
  "$HF_HOME" \
  "$ELENKHOS_DATA"/{raw-audit,curated,tokenized} \
  "$ELENKHOS_ARTIFACTS"/{checkpoints,adapters,releases} \
  "$ELENKHOS_ROOT/reports"

df -h /workspace
```

Abort an expensive run when `/workspace` has less than 15GB free. Do not put
token shards or checkpoints in the container layer, and do not train directly
from a mounted Google Drive directory.

## 4. Typed Configuration Scaffold

```python
# src/elenkhos/model/config.py
from dataclasses import dataclass


@dataclass(frozen=True)
class ModelConfig:
    vocab_size: int
    context_length: int
    num_layers: int
    d_model: int
    num_q_heads: int
    num_kv_heads: int
    d_ff: int
    rope_theta: float = 10_000.0
    rms_eps: float = 1e-5
    tie_embeddings: bool = True

    def __post_init__(self) -> None:
        if self.d_model % self.num_q_heads:
            raise ValueError("d_model must be divisible by num_q_heads")
        if self.num_q_heads % self.num_kv_heads:
            raise ValueError("num_q_heads must be divisible by num_kv_heads")
        if self.context_length <= 0 or self.vocab_size <= 0:
            raise ValueError("context_length and vocab_size must be positive")
```

Example `configs/model/small-25m-gqa.yaml`:

```yaml
name: small-25m-gqa
vocab_size: 16384
context_length: 512
num_layers: 12
d_model: 384
num_q_heads: 6
num_kv_heads: 2
d_ff: 1024
rope_theta: 10000
rms_eps: 1.0e-5
tie_embeddings: true
expected_total_parameters: 25175424
```

Required frozen model configs:

```yaml
# configs/model/micro-117k.yaml
name: micro-117k
vocab_size: 256
context_length: 64
num_layers: 2
d_model: 64
num_q_heads: 4
num_kv_heads: 4
d_ff: 176
expected_total_parameters: 117056
```

```yaml
# configs/model/scale-11m.yaml
name: scale-11m
vocab_size: 16384
context_length: 512
num_layers: 6
d_model: 288
num_q_heads: 6
num_kv_heads: 6
d_ff: 768
expected_total_parameters: 10694304
expected_non_embedding_parameters: 5975712
```

```yaml
# configs/model/small-28m-mha.yaml
name: small-28m-mha
vocab_size: 16384
context_length: 512
num_layers: 12
d_model: 384
num_q_heads: 6
num_kv_heads: 6
d_ff: 1024
expected_total_parameters: 27534720
expected_non_embedding_parameters: 21243264
```

```yaml
# configs/model/elenkhos-70m-lab.yaml
name: elenkhos-70m-lab
vocab_size: 16384
context_length: 1024
num_layers: 13
d_model: 640
num_q_heads: 10
num_kv_heads: 5
d_ff: 1792
expected_total_parameters: 71205760
expected_non_embedding_parameters: 60720000
```

`accounting.py` must fail config validation when its computed count differs
from either expected count.

Example training configuration:

```yaml
run_id: r6-domainmix
seed: 336
model: configs/model/small-25m-gqa.yaml
data: configs/data/domainmix-50m.yaml
optimizer:
  name: adamw
  peak_lr: 5.0e-4
  betas: [0.9, 0.95]
  eps: 1.0e-8
  weight_decay: 0.1
schedule:
  name: warmup_cosine
  warmup_fraction: 0.01
  min_lr_ratio: 0.1
batch:
  micro_batch_size: 8
  gradient_accumulation_steps: 8
precision: bf16
gradient_clip: 1.0
activation_checkpointing: false
attention_backend: eager
compile: false
target_tokens: 50000000
eval_every_tokens: 5000000
checkpoint_policy:
  rotating_full_state: 2
  model_only_milestones: [0.25, 0.50, 0.75, 1.00]
```

Validate all configs before GPU allocation. A run must refuse to start when the
data manifest, tokenizer hash, output directory, or checkpoint-resume state is
inconsistent.

### A3 Run Matrix

Generate, review, and commit the nine configs before running any of them:

```yaml
compute_budgets_flops: [8.4e14, 1.68e15, 3.36e15]
models:
  - path: configs/model/scale-11m.yaml
    expected_total_parameters: 10694304
    expected_non_embedding_parameters: 5975712
  - path: configs/model/small-28m-mha.yaml
    expected_total_parameters: 27534720
    expected_non_embedding_parameters: 21243264
  - path: configs/model/elenkhos-70m-lab.yaml
    expected_total_parameters: 71205760
    expected_non_embedding_parameters: 60720000
token_formula: floor(compute_budget_flops / (6 * non_embedding_parameters))
min_tokens: 2000000
max_tokens: 100000000
fit_budgets: [8.4e14, 1.68e15]
held_out_budget: 3.36e15
```

Expected generated token targets:

| Budget | `scale-11m` | `small-28m-mha` | `elenkhos-70m-lab` |
|---|---:|---:|---:|
| `8.4e14` | 23,428,170 | 6,590,324 | 2,305,665 |
| `1.68e15` | 46,856,341 | 13,180,648 | 4,611,330 |
| `3.36e15` | 93,712,682 | 26,361,297 | 9,222,661 |

```bash
uv run python -m elenkhos.scaling.run_matrix \
  --config configs/train/isoflops-low.yaml \
  --output artifacts/manifests/isoflops-low.json
uv run python -m elenkhos.scaling.run_matrix \
  --config configs/train/isoflops-mid.yaml \
  --output artifacts/manifests/isoflops-mid.json

# Commit reports/held-out-prediction.yaml before launching this command.
uv run python -m elenkhos.scaling.run_matrix \
  --config configs/train/isoflops-high.yaml \
  --output artifacts/manifests/isoflops-high.json
```

The fit code must consume measured run records rather than filenames or
hand-entered losses. Preserve a boolean `used_for_fit` field so the third
budget cannot accidentally leak into the prediction.

### Local-to-Cloud Data Scaffold

Remote dataset streaming stops at the materialization boundary. Training reads
only checksummed local shards.

```python
# src/elenkhos/data/manifests.py
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class MaterializationSpec:
    dataset_id: str
    dataset_revision: str
    split: str
    selector_seed: int
    max_documents: int
    output_parquet: Path
    output_manifest: Path


@dataclass(frozen=True)
class TokenShardSpec:
    input_manifest: Path
    tokenizer_path: Path
    output_bin: Path
    output_index: Path
    dtype: str = "uint16"
```

```python
# scripts/materialize_data.py
def materialize(spec: MaterializationSpec) -> None:
    """Stream, select, normalize, filter, and write an immutable snapshot."""
    # TODO: load the pinned remote iterable dataset.
    # TODO: select records by a stable document hash, never iterator position.
    # TODO: write normalized Parquet and a manifest with counts/checksums.
    raise NotImplementedError
```

```python
# src/elenkhos/training/batcher.py
class MMapTokenDataset:
    def __init__(self, token_path, index_path, context_length, seed):
        # TODO: validate shard/index checksums and memory-map the uint16 shard.
        ...

    def batch_at(self, global_batch_index, batch_size):
        # TODO: derive deterministic offsets from seed and global batch index.
        # The sampler position must be serializable for exact resume.
        ...
```

Required local commands:

```bash
uv run python scripts/materialize_data.py \
  --config configs/data/local-pretrain-10m.yaml
uv run python scripts/tokenize_data.py \
  --config configs/data/local-pretrain-10m.yaml
uv run python -m elenkhos.cli train \
  --config configs/train/debug-2m-local.yaml
uv run python scripts/check_resume_parity.py \
  --run artifacts/runs/debug-2m-local
uv run python scripts/run_a3_matrix.py \
  --config configs/train/a3-local-rehearsal.yaml
```

Promotion tests must fail if a training config points at a remote iterable
dataset, if a shard checksum differs, or if resume restores a different sampler
position.

### A2 Benchmark Scaffold

```python
# src/elenkhos/training/benchmark.py
from dataclasses import dataclass
from typing import Literal

import torch


@dataclass(frozen=True)
class BenchmarkResult:
    mode: str
    warmup_steps: int
    measurement_steps: int
    mean_ms: float
    std_ms: float
    p50_ms: float
    p95_ms: float
    tokens_per_second: float
    peak_allocated_bytes: int
    peak_reserved_bytes: int


def benchmark_step(
    model: torch.nn.Module,
    input_ids: torch.Tensor,
    *,
    mode: Literal["forward", "forward_backward", "train_step"],
    warmup_steps: int = 5,
    measurement_steps: int = 10,
) -> BenchmarkResult:
    # TODO: construct the selected workload.
    # TODO: synchronize before and after every timed CUDA iteration.
    # TODO: reset and capture peak memory outside the warmup region.
    # TODO: report the full distribution, not only the minimum.
    raise NotImplementedError
```

Commit the matrix before profiling:

```yaml
models: [scale-11m, elenkhos-70m-lab]
contexts: [128, 256, 512]
modes: [forward, forward_backward, train_step]
precisions: [fp32, bf16]
backends: [eager, sdpa, compile]
warmup_steps: 5
measurement_steps: 10
micro_batch_size: 4
```

Use random token IDs for this matrix. Benchmark the mmap input pipeline
separately. The profiling script must emit environment metadata and named
Nsight captures for the reference and selected optimized 70M steps.

## 5. Data Record and Manifest Schemas

Minimum normalized document record:

```json
{
  "document_id": "sha256:...",
  "source_id": "pg-plato-republic",
  "source_revision": "gutenberg-1497-retrieved-2026-06-13",
  "license": "public-domain-us-item-checked",
  "url": "https://www.gutenberg.org/ebooks/1497",
  "author": "Plato",
  "work_id": "republic",
  "chapter_id": "book-1",
  "language": "en",
  "text_sha256": "...",
  "text": "...",
  "stage_decisions": {
    "language": {"keep": true, "score": 0.99},
    "pii": {"keep": true, "masked_spans": 0},
    "quality_rules": {"keep": true, "failed": []},
    "quality_classifier": {"keep": true, "score": 0.83},
    "exact_dedup": {"keep": true, "cluster_id": null},
    "minhash": {"keep": true, "cluster_id": null}
  }
}
```

Every manifest must include:

- source/model name and immutable revision;
- retrieval timestamp and URL;
- displayed license plus manual interpretation;
- file and normalized-content SHA-256;
- deterministic selector and seed;
- input/output row and byte counts;
- every stage's configuration hash;
- train/validation/test group key;
- exclusions and known limitations.

Do not commit raw Common Crawl PII or rejected sensitive examples. Store only
redacted audit records and aggregate counts.

Quality-classifier dataset contract:

- positive URLs: external references extracted from one pinned English
  Wikipedia dump, or the CS336 A4 URL list when legitimately accessible;
- negatives: random pages from the same Common Crawl snapshot used for the raw
  audit;
- 5,000 positive and 5,000 negative pages after extraction/baseline filtering;
- train/validation/test split by registrable domain, not by page;
- report label noise, domain distribution, calibration, precision/recall, and
  20 classifier/rule disagreement audits.

## 6. Model Adapter and Test Scaffolds

Keep tests implementation-independent:

```python
# tests/adapters.py
from torch import Tensor


def run_attention(
    q: Tensor,
    k: Tensor,
    v: Tensor,
    mask: Tensor | None,
) -> Tensor:
    from elenkhos.model.attention import scaled_dot_product_attention

    return scaled_dot_product_attention(q=q, k=k, v=v, mask=mask)
```

Example correctness test:

```python
import torch


def test_attention_is_causal(adapters):
    q = torch.randn(1, 2, 4, 8)
    k = torch.randn(1, 2, 4, 8)
    v = torch.randn(1, 2, 4, 8)
    allowed = torch.tril(torch.ones(4, 4, dtype=torch.bool))

    baseline = adapters.run_attention(q, k, v, mask=allowed)
    v_changed = v.clone()
    v_changed[..., 3, :] += 1000
    changed = adapters.run_attention(q, k, v_changed, mask=allowed)

    torch.testing.assert_close(baseline[..., :3, :], changed[..., :3, :])
```

Required test classes:

- exact numeric parity against a small PyTorch reference;
- shape and dtype invariants;
- randomized/property tests for tokenizer and split determinism;
- gradient checks on tiny double-precision tensors;
- one-batch overfit;
- checkpoint resume including Python, NumPy, CPU/CUDA RNG and data cursor;
- expected-failure tests for malformed manifests and release files.

## 7. Post-Training Contract

Primary controlled runs use `enable_thinking=False`. The untouched Qwen3
thinking mode is a separate required baseline. Never train raw `<think>` text
or include it in conversation history.

Teacher generation profiles:

```yaml
# configs/posttrain/teacher-generation.yaml
primary:
  model: Qwen/Qwen3-32B-AWQ
  revision: 0499c3ac83fdef8810b907a23894ba91e95eddd8
  minimum_gpu_memory_gb: 48
fallback:
  model: Qwen/Qwen3-14B-AWQ
  revision: 31c69efc29464b6bb0aee1398b5a7b50a99340c3
  minimum_gpu_memory_gb: 24
generation:
  enable_thinking: true
  temperature: 0.6
  top_p: 0.95
  top_k: 20
  candidates_per_item: 3
  max_new_tokens: 1024
retention:
  keep_thinking_text: false
  require_schema_parse: true
  require_deterministic_or_human_verification: true
```

Run a 200-source-item pilot before full generation. Compare 14B-AWQ and
32B-AWQ acceptance rate, verifier pass rate, schema validity, duplicate rate,
tokens per accepted example, wall time, and cost. Use 14B if its verified
acceptance is within five absolute points of 32B; otherwise budget a 48GB
teacher-generation GPU separately from the 24GB training GPU.

Generate one candidate per source first and retry failed candidates at most
twice. After the 200-item pilot, write `reports/teacher-budget.yaml` with the
measured acceptance rate, mean generated tokens, aggregate tokens/second,
projected candidate count, projected GPU-hours, and projected cost.

Minimal DPO reference interface:

```python
def dpo_loss(
    policy_chosen_logps,
    policy_rejected_logps,
    reference_chosen_logps,
    reference_rejected_logps,
    beta: float,
):
    """Return per-example losses and chosen/rejected rewards.

    Implement directly from the DPO paper, then compare a fixed two-example
    fixture against TRL. Do not copy trainer internals.
    """
    raise NotImplementedError
```

## 8. Evaluation Protocol

Required baselines:

1. untouched student, non-thinking;
2. untouched student, native thinking;
3. prompt-only Socratic policy, non-thinking;
4. answer-only SFT;
5. structured-trajectory SFT;
6. DPO initialized from structured SFT.

Freeze prompts, chat template, sampling profile, parser version, test hashes,
and question budget before evaluating candidates.

Dataset-size stages are 2,000, 4,000, and at most 8,000 accepted examples.
Proceed from 4K to 8K only when the 4K adapter improves the registered primary
metric by at least two absolute points over the 2K adapter without violating
the correctness floor. DPO starts with 4,000 hard-case pairs and may expand to
8,000; 12,000 pairs are not part of the summer plan.

Question-policy metrics:

```text
required_slot_recall =
  required hidden slots correctly targeted before answer / all required slots

question_precision =
  decision-relevant questions / all questions asked

premature_answer_rate =
  answered while at least one required slot remained unresolved / answer cases

redundancy_rate =
  repeated already-resolved slot questions / all questions

leakage_rate =
  questions containing protected answer facts / all questions

correct_immediate_answer_rate =
  correctly answered fully specified cases without unnecessary questions /
  all fully specified cases
```

Report per-source macro averages and paired bootstrap 95% confidence intervals.
Do not pool thousands of synthetic templates into one score that overwhelms
the 200-item human set. For subjective dialectic scores, double-score at least
50 items, report agreement, and preserve disagreement examples.

## 9. Serving Build Scaffold

Minimal `CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.25)
project(elenkhos_serve LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(ELENKHOS_ENABLE_SANITIZERS "Enable ASan/UBSan" ON)

add_library(elenkhos_core
  src/scheduler/bounded_queue.cc
  src/admission/capacity_model.cc
  src/release/manifest.cc
  src/release/qualification_gate.cc
  src/release/state_machine.cc
)
target_include_directories(elenkhos_core PUBLIC include)

add_executable(elenkhos-serve src/main.cc)
target_link_libraries(elenkhos-serve PRIVATE elenkhos_core)

enable_testing()
add_subdirectory(tests)
```

Release manifest minimum:

```json
{
  "release_id": "elenkhos-1.7b-dpo-q4_k_m-r01",
  "model": {
    "hf_repo": "local/elenkhos-1.7b-dpo",
    "source_revision": "...",
    "adapter_revision": "...",
    "gguf_sha256": "...",
    "tokenizer_sha256": "...",
    "quantization": "Q4_K_M"
  },
  "runtime": {
    "name": "llama.cpp",
    "revision": "...",
    "build_flags": ["GGML_METAL=ON"]
  },
  "limits": {
    "context_tokens": 4096,
    "max_concurrency": 2,
    "max_queued_tokens": 16384
  },
  "quality_baseline": "eval:...",
  "slo_profile": "slo:local-m4-v1"
}
```

The admission model starts conservative:

```text
predicted_process_peak_bytes =
  resident_model_bytes
  + runtime_overhead_bytes
  + active_requests_kv_bytes
  + prompt_tokens * kv_bytes_per_token
  + max_new_tokens * kv_bytes_per_token
  + safety_margin_bytes
```

Calibrate this estimate against observed unified-memory use. A request is
rejected before enqueue when the predicted peak exceeds the release profile.

## 10. Benchmark Protocol

Use three deterministic request traces:

- `short`: 128-512 prompt tokens, 32-128 output tokens;
- `mixed`: 128-2,048 prompt tokens, 32-512 output tokens;
- `overload`: the mixed distribution at increasing arrival rates.

For every system/quantization release:

1. start from a cold model load and record load time;
2. run 10 warmup requests excluded from latency statistics;
3. replay the same seeded trace for at least three trials;
4. record request arrival, queue, first-token, each-token, and completion times;
5. report TTFT, inter-token latency, TPOT, end-to-end latency, throughput,
   output-token throughput, rejection/error rate, peak memory, and goodput;
6. publish the raw JSONL events and analysis script;
7. pre-register SLOs from the base release before comparing candidates.

Definitions:

```text
TTFT = first_token_time - request_arrival_time
TPOT = (completion_time - first_token_time) / max(output_tokens - 1, 1)
goodput = completed requests meeting every configured SLO / wall-clock second
```

Do not compare Mac and CUDA throughput as if hardware were controlled. Use the
cloud result as a runtime reference and the M4 result as the deployment target.

## 11. CI and Acceptance Commands

Training repository:

```bash
uv run pytest -q
uv run pytest tests/model tests/training -q
uv run pytest tests/posttrain -q
uv run ruff check .
uv run mypy src
uv run python -m elenkhos.cli validate-configs configs/
uv run python -m elenkhos.cli validate-manifests artifacts/manifests/
```

Serving repository:

```bash
cmake --preset debug
cmake --build --preset debug -j
ctest --preset debug --output-on-failure
cmake --preset asan
cmake --build --preset asan -j
ctest --preset asan --output-on-failure
python3 bench/loadgen.py --trace bench/traces/short.jsonl --dry-run
```

Release qualification:

```bash
uv run python scripts/run_eval.py --release releases/manifests/candidate.json
python3 bench/loadgen.py \
  --release releases/manifests/candidate.json \
  --trace bench/traces/mixed.jsonl \
  --output reports/candidate-events.jsonl
python3 bench/analyze.py \
  --events reports/candidate-events.jsonl \
  --slo configs/slo.yaml
```

The public README must show the exact commands that reproduce one smoke run,
one evaluation table, one M4 benchmark, one blocked release, and one rollback.
