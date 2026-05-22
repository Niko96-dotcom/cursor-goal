#!/usr/bin/env node
import fs from "node:fs/promises"
import { parseCli, usage } from "./args.js"
import { continuationPromptForState, recordCheckpoint } from "./checkpoint.js"
import {
  addHistory,
  appendRunLog,
  clearGoalState,
  createGoalState,
  formatGoalStatus,
  loadGoalState,
  resolveModelLabel,
  resolveStateDir,
  saveGoalState,
  setGoalStatus,
  updateGoalFromCommand,
  writeInitialRunLog,
} from "./state.js"
import type { GoalAction, ParsedCli } from "./types.js"
import { PACKAGE_VERSION } from "./version.js"
import { workingTreeSummary } from "./validation.js"

const CONTINUE_HINT = "Continue in Cursor Agent chat with: /goal resume"

async function main(argv: string[]) {
  const command = parseCli(argv)
  const stateDir = resolveStateDir(command.cwd, command.stateDir)
  await actionHandlers[command.action]({ command, stateDir })
}

type HandlerContext = {
  command: ParsedCli
  stateDir: string
}

const actionHandlers: Record<GoalAction, (ctx: HandlerContext) => Promise<void>> = {
  help: async () => {
    console.log(usage())
  },

  version: async () => {
    console.log(PACKAGE_VERSION)
  },

  status: async ({ command, stateDir }) => {
    printStatus(await loadGoalState(stateDir), command.json)
  },

  clear: async ({ stateDir }) => {
    const existing = await loadGoalState(stateDir)
    if (existing) {
      await appendRunLog(existing, `## Cleared\n\nCleared: ${new Date().toISOString()}`)
    }
    const removed = await clearGoalState(stateDir)
    console.log(removed ? "Goal cleared." : "No goal to clear.")
  },

  pause: async ({ command, stateDir }) => {
    const state = await requireState(stateDir)
    setGoalStatus(state, "paused", "Paused by user.")
    await saveGoalState(stateDir, state)
    await appendRunLog(state, `## Paused\n\nPaused: ${new Date().toISOString()}`)
    printStatus(state, command.json)
  },

  prompt: async ({ stateDir }) => {
    const state = await requireState(stateDir)
    console.log(continuationPromptForState(state))
  },

  checkpoint: async ({ command, stateDir }) => {
    const assistantText = await readAssistantText(command.assistantFile)
    if (!assistantText.trim()) {
      throw new Error("cursor-goal checkpoint requires assistant text via stdin or --assistant-file.")
    }

    const state = await recordCheckpoint({
      stateDir,
      command,
      assistantText,
      toolCallCount: command.toolCalls,
    })
    printStatus(state, command.json)
    if (state.status === "active") {
      console.log(CONTINUE_HINT)
    }
  },

  set: async ({ command, stateDir }) => {
    const model = resolveModelLabel(command.model, command.tier)
    for (const warning of model.warnings) console.warn(`[model] ${warning}`)

    const state = createGoalState(command, model)
    const dirty = workingTreeSummary(state.cwd)
    if (dirty) addHistory(state, "working_tree_dirty_at_start", { status: dirty })
    await writeInitialRunLog(state)
    if (dirty) await appendRunLog(state, `## Initial working tree was not clean\n\n\`\`\`\n${dirty}\n\`\`\``)
    await saveGoalState(stateDir, state)
    console.log(`Goal set: ${state.objective}`)
    console.log(CONTINUE_HINT)
    printStatus(state, command.json)
  },

  edit: async ({ command, stateDir }) => {
    await editOrResume({ command, stateDir, label: "Edited" })
  },

  resume: async ({ command, stateDir }) => {
    await editOrResume({ command, stateDir, label: "Resumed" })
  },
}

async function editOrResume(options: { command: ParsedCli; stateDir: string; label: "Edited" | "Resumed" }) {
  const { command, stateDir, label } = options
  const model = resolveModelLabel(command.model, command.tier)
  for (const warning of model.warnings) console.warn(`[model] ${warning}`)

  const state = await requireState(stateDir)
  updateGoalFromCommand(state, command, model)
  await appendRunLog(
    state,
    `## ${label}\n\nAt: ${new Date().toISOString()}${command.objective ? `\n\nNew objective:\n${command.objective}` : ""}`
  )
  await saveGoalState(stateDir, state)
  console.log(label === "Edited" ? "Goal edited." : "Goal resumed.")
  console.log(CONTINUE_HINT)
  printStatus(state, command.json)
}

async function requireState(stateDir: string) {
  const state = await loadGoalState(stateDir)
  if (!state) throw new Error("No goal exists. Set one with: /goal \"<objective>\" or cursor-goal \"<objective>\" --verify \"npm test\"")
  return state
}

async function readAssistantText(filePath?: string) {
  if (filePath) {
    return fs.readFile(filePath, "utf8")
  }

  if (process.stdin.isTTY) {
    return ""
  }

  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString("utf8")
}

function printStatus(state: Awaited<ReturnType<typeof loadGoalState>>, asJson: boolean) {
  if (asJson) {
    console.log(JSON.stringify(state, null, 2))
  } else {
    console.log(formatGoalStatus(state))
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
