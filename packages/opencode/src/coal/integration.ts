import { appendFile, mkdir, writeFile } from "fs/promises"
import path from "path"

const COLD_LIMIT = 12_000

type HotEvent = {
  type: string
  sessionID: string
  messageID?: string
  callID?: string
  tool?: string
  reason?: string
  timestamp?: number
  metadata?: Record<string, unknown>
}

export async function coldContext(worktree: string) {
  if (process.env.COALCODE_COLD_DISABLED === "1") return undefined

  const files = await Promise.all(
    [".coal/cold.md", ".coal/cold.json", "COAL.md", "coal.md"].map(async (name) => {
      const file = path.join(worktree, name)
      if (!(await Bun.file(file).exists())) return undefined
      return {
        name,
        text: truncate(await Bun.file(file).text()),
      }
    }),
  )

  const available = files.filter((file) => file !== undefined)
  if (available.length === 0) return undefined

  return [
    "<coal-cold-context>",
    "CoalCode Cold Coal integration is enabled.",
    "Cold Coal is the persistent compressed codebase model. Treat it as orientation, not proof.",
    "When Cold Coal and live repository state conflict, verify against live files and prefer live evidence.",
    "",
    ...available.map((file) => [`<cold-file path="${file.name}">`, file.text, "</cold-file>"].join("\n")),
    "</coal-cold-context>",
  ].join("\n")
}

export async function hotEvent(worktree: string, event: HotEvent) {
  if (process.env.COALCODE_HOT_DISABLED === "1") return

  const dir = path.join(worktree, ".coal", "hot")
  const payload = {
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  }

  await mkdir(dir, { recursive: true })
  await appendFile(path.join(dir, "events.jsonl"), JSON.stringify(payload) + "\n")
  await writeFile(path.join(dir, "state.json"), JSON.stringify(payload, null, 2) + "\n")
}

export async function status(worktree: string) {
  const coldFiles = await Promise.all(
    [".coal/cold.md", ".coal/cold.json", "COAL.md", "coal.md"].map(async (name) => ({
      name,
      exists: await Bun.file(path.join(worktree, name)).exists(),
    })),
  )
  const hotState = path.join(worktree, ".coal", "hot", "state.json")
  const activeColdFiles = coldFiles.filter((file) => file.exists).map((file) => file.name)
  const hotActive = await Bun.file(hotState).exists()
  const latestHot = hotActive ? await Bun.file(hotState).text() : undefined

  return {
    cold: {
      enabled: process.env.COALCODE_COLD_DISABLED !== "1",
      files: activeColdFiles,
      active: activeColdFiles.length > 0,
    },
    hot: {
      enabled: process.env.COALCODE_HOT_DISABLED !== "1",
      active: hotActive,
      events: ".coal/hot/events.jsonl",
      latest: latestHot ? JSON.parse(latestHot) : undefined,
    },
  }
}

function truncate(text: string) {
  if (text.length <= COLD_LIMIT) return text
  return text.slice(0, COLD_LIMIT) + "\n\n[Cold Coal context truncated by CoalCode.]"
}

export * as CoalIntegration from "./integration"
