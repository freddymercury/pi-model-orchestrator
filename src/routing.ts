export type ExecutionMode = "interactive" | "background";
export type Locality = "hosted-ok" | "local-only";

export type RoutingInput = {
  mode: ExecutionMode;
  locality: Locality;
  localSafe: boolean;
};

export const LOCAL_WORKER_MODEL = "ollama/qwen2.5-coder:7b";

/**
 * Choose only between the explicit local route and Pi's normal auto route.
 * Complexity remains the responsibility of pi-model-router once "auto" wins.
 */
export function selectWorkerModel(input: RoutingInput): string {
  if (input.locality === "local-only") {
    return LOCAL_WORKER_MODEL;
  }

  if (input.mode === "background" && input.localSafe) {
    return LOCAL_WORKER_MODEL;
  }

  return "auto";
}
