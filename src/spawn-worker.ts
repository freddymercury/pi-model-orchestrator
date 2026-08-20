import { orchestrate } from "@0xkobold/pi-orchestration";
import { selectWorkerModel, type Locality, type ExecutionMode } from "./routing.js";

export type SpawnWorkerInput = {
  task: string;
  mode: ExecutionMode;
  locality?: Locality;
  localSafe?: boolean;
};

/**
 * Thin adapter around pi-orchestration.
 *
 * The caller supplies execution context that it already knows. We do not ask
 * another model to infer whether a background task is background.
 */
export async function spawnWorker(
  input: SpawnWorkerInput,
  ctx: unknown,
) {
  const model = selectWorkerModel({
    mode: input.mode,
    locality: input.locality ?? "hosted-ok",
    localSafe: input.localSafe ?? false,
  });

  return orchestrate(
    {
      agent: "worker",
      task: input.task,
      model,
    },
    ctx as never,
  );
}
