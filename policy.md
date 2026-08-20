# Routing policy

Use two independent decisions:

1. **Execution mode**: is the caller waiting synchronously, or is the job latency-tolerant/background?
2. **Task complexity**: routine, substantial, or high-stakes/ambiguous.

## Deterministic first decision

If the orchestrator already knows a task is background/latency-tolerant and local-safe, route it directly to the local model. Do not spend a classifier call to rediscover that fact.

Examples:

- diff inventory
- symbol extraction
- repetitive code transforms
- boilerplate/test stub generation
- log summarization
- HTML assembly

Default local model:

```text
ollama/qwen2.5-coder:7b
```

## Interactive path

All normal interactive work goes through `pi-model-router`:

```text
low    -> Haiku 4.5
medium -> DeepSeek V4 Flash Latest
high   -> Claude Sonnet Latest
```

This keeps mundane interactive tasks fast instead of penalizing them with local latency.

## Complexity guidance

### Low

Routine, mechanical, low-ambiguity work where mistakes are easy to detect.

### Medium

Normal implementation, moderate debugging, codebase exploration, and substantial reasoning where cost still matters.

### High

Architecture, security-sensitive work, difficult debugging, ambiguous requirements, correctness-critical review, or final synthesis that carries meaningful downstream risk.

## Privacy override

Privacy/locality is a hard constraint, not a soft classifier suggestion. If data must remain local, remove hosted models from the eligible set before routing.

## Escalation

Escalate because evidence shows the task was under-classified, not merely because every answer deserves a second expensive opinion.

Suggested chain:

```text
local -> medium -> high
```

For interactive low-tier tasks, avoid automatic `Haiku -> Sonnet` escalation unless the result or task reveals genuinely higher complexity.

## Observability

Record at least:

- agent role
- task ID
- requested execution mode
- privacy/locality constraint
- chosen tier
- concrete model
- provider
- first-token latency
- total latency
- input/output tokens
- estimated cost
- fallback/escalation reason
- success/failure

These measurements should eventually replace assumptions about which route is "fast" or "cheap" on a given machine/provider.
