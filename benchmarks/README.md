# Local routing benchmark

Do not treat `local` as automatically fast or cheap. Measure it on the actual machine.

## Initial target

Start with:

```text
ollama/qwen2.5-coder:7b
local concurrency: 1
```

## Benchmark prompts

Use at least these task classes:

1. summarize a 500-line log
2. extract symbols from a medium TypeScript file
3. generate simple unit-test stubs
4. perform a repetitive rename/refactor
5. explain a straightforward function

Run the same prompts through the local model and the interactive low-tier hosted model.

## Record

For each run capture:

- prompt/task class
- model
- context size
- time to first token
- total latency
- output tokens
- tokens/second when available
- peak memory / observed memory pressure
- correctness/pass-fail
- whether the response required a retry or escalation

## Decision rule

Keep a task class local when it is:

- reliable enough for the task,
- materially cheaper or privacy-preferred,
- and its latency is acceptable for the requested execution mode.

If the hosted low tier is consistently faster for interactive use, keep that class hosted even if the local model can technically solve it.

## Concurrency test

Only after single-worker measurements are stable:

1. run two small local tasks concurrently,
2. observe memory pressure and latency degradation,
3. compare throughput with sequential execution.

Raise local concurrency above `1` only when aggregate throughput improves without unacceptable memory pressure or failure rate.
