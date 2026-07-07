import { Effect, Schema } from "effect"
import { InstanceState } from "@/effect/instance-state"
import { CoalIntegration } from "@/coal/integration"
import * as Tool from "./tool"

export const Parameters = Schema.Struct({})

export const CoalStatusTool = Tool.define(
  "coal_status",
  Effect.succeed({
    description: [
      "Inspect CoalCode hot and cold integration state for the current workspace.",
      "Use this to see whether persistent Cold Coal context is available and whether Hot Coal telemetry is being recorded.",
    ].join("\n"),
    parameters: Parameters,
    execute: () =>
      Effect.gen(function* () {
        const ctx = yield* InstanceState.context
        const status = yield* Effect.promise(() => CoalIntegration.status(ctx.worktree))
        return {
          title: "CoalCode status",
          metadata: status,
          output: JSON.stringify(status, null, 2),
        }
      }).pipe(Effect.orDie),
  }),
)
