# pi-model-orchestrator

Opinionated model routing and sub-agent policy for Pi: local Ollama for latency-tolerant mechanical work, fast hosted models for interactive simple work, economical hosted reasoning for normal complexity, and a premium frontier model for hard or correctness-sensitive work.

## Design

Pi does two different jobs here:

1. **Sub-agent orchestration** decides what work to delegate.
2. **Model routing** decides which model should execute each delegated job.

OpenRouter is a third layer: after a hosted model is chosen, OpenRouter handles the provider/API path and can provide provider-level routing/fallback behavior.

```text
request / child task
        |
        +-- explicitly latency-tolerant + local-safe --> Ollama local
        |
        `-- interactive / normal --------------------> pi-model-router
                                                        low    -> Haiku
                                                        medium -> DeepSeek
                                                        high   -> Sonnet
```

The important rule is that **local is not a quality tier**. It is an execution policy for work where latency is acceptable, data may benefit from staying local, and the task fits the local model.

## Why not make Ollama the `low` tier?

Because `pi-model-router` currently exposes three tiers: `low`, `medium`, and `high`. A mundane interactive task should not be routed to a slow local model just because it is easy. The three interactive tiers therefore stay hosted:

- low: fast/small hosted model
- medium: economical strong model
- high: premium frontier model

Ollama is selected explicitly by sub-agent policy for background/latency-tolerant work.

## Current model policy

| Execution class | Default |
|---|---|
| Local/background | `ollama/qwen2.5-coder:7b` |
| Interactive low | `openrouter/anthropic/claude-haiku-4.5` |
| Interactive medium | `openrouter/deepseek/deepseek-v4-flash-latest` |
| Interactive high | `openrouter/~anthropic/claude-sonnet-latest` |

Concrete model choices are configuration, not agent identity. A `worker` should normally request `auto`, `local`, or a capability class rather than permanently meaning Qwen/DeepSeek/Sonnet.

## Files

```text
models.json                 # Pi custom provider/model registry example
model-router.json           # pi-model-router config
policy.md                   # deterministic local-vs-hosted decision policy
agents/worker.md            # sub-agent worker policy
benchmarks/README.md        # local benchmark procedure
```

## Install dependencies

```bash
pi install npm:@yeliu84/pi-model-router
npm install @0xkobold/pi-orchestration
```

`pi-model-router` reads global config from `~/.pi/agent/model-router.json` or project config from `.pi/model-router.json`.

`pi-orchestration` supports `model: "auto"`, explicit model IDs such as `ollama/...`, and Pi's registered custom providers.

## Setup

1. Install Ollama and pull the local model:

```bash
ollama pull qwen2.5-coder:7b
```

2. Export your OpenRouter API key:

```bash
export OPENROUTER_API_KEY="..."
```

3. Merge `models.json` into your Pi model registry configuration.
4. Copy `model-router.json` to `~/.pi/agent/model-router.json`.
5. Use the policy in `policy.md` when spawning sub-agents.
6. Run the benchmark before raising local concurrency above 1.

## Machine target

The initial local defaults are conservative for an Apple Silicon laptop with 18 GB unified memory: one substantial Ollama worker at a time and a 7B-class coder as the default local worker. Benchmark before changing either assumption.

## Status

This repo intentionally separates verified Pi capabilities from policy that still needs an integration hook. `pi-model-router`'s three tiers and `pi-orchestration`'s model override are verified. Automatic propagation of an `interactive/background` metadata field through every Pi invocation is not assumed; until that is implemented, the orchestrator should choose the local route explicitly when it knows the job is latency-tolerant.
