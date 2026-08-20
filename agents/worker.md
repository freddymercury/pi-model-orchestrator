# Worker routing contract

Workers are not permanently tied to one model. The orchestrator chooses an execution class per task.

## Inputs

A worker task should carry, when known:

```ts
type WorkerRouting = {
  mode: "interactive" | "background";
  locality: "hosted-ok" | "local-only";
  complexity?: "low" | "medium" | "high";
  model?: "auto" | string;
};
```

## Selection rules

1. `local-only` always removes hosted models from consideration.
2. `background + hosted-ok` may use local when the task is mechanical/low-risk and fits the local model.
3. `interactive + hosted-ok` should normally use `model: "auto"` and let `pi-model-router` select low/medium/high.
4. Explicit model IDs are for deliberate overrides, not defaults.

## Example

```ts
import { orchestrate } from "@0xkobold/pi-orchestration";

type ExecutionClass = "interactive" | "background";

type SpawnOptions = {
  task: string;
  mode: ExecutionClass;
  localSafe?: boolean;
};

export async function spawnWorker({ task, mode, localSafe = false }: SpawnOptions, ctx: unknown) {
  const model =
    mode === "background" && localSafe
      ? "ollama/qwen2.5-coder:7b"
      : "auto";

  return orchestrate(
    {
      agent: "worker",
      task,
      model,
    },
    ctx,
  );
}
```

The example intentionally does not classify complexity itself. When `model: "auto"` is used, the normal Pi model registry/router path remains responsible for choosing the hosted tier.

## Good local worker tasks

- enumerate changed files
- extract symbols and references
- repetitive transformations
- generate straightforward test stubs
- summarize logs or command output
- assemble deterministic HTML/JSON

## Keep hosted by default

- ambiguous implementation work
- architecture decisions
- security-sensitive reasoning
- debugging with multiple plausible causes
- final review/synthesis
- tasks where a human is synchronously waiting and measured local latency is worse

## Concurrency

Default local concurrency is `1` until benchmarks show the machine has enough memory and acceptable latency for more. Hosted workers may have a separate concurrency limit.
