import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import { parseGoalState } from "./parseGoalState.js"
import { truncateText } from "./text.js"
import type {
  GoalHistoryEvent,
  GoalHistoryEventName,
  GoalLifecycleStatus,
  GoalState,
  ModelTier,
  ParsedCli,
  ResolvedModelSummary,
  ValidationResult,
} from "./types.js"

const CURRENT_FILE = "current.json"

export function resolveModelLabel(requested: string, tier: ModelTier): ResolvedModelSummary {
  const label = requested.trim()
  const warnings =
    tier === "auto"
      ? []
      : [`Requested tier ${tier}; Cursor chat uses the model selected in the composer.`]

  return { requested: label, label, warnings }
}

export function resolveStateDir(cwd: string, explicit?: string) {
  return explicit ? path.resolve(explicit) : path.join(cwd, ".goal")
}

export function currentStatePath(stateDir: string) {
  return path.join(stateDir, CURRENT_FILE)
}

export async function loadGoalState(stateDir: string): Promise<GoalState | null> {
  try {
    const raw = await fs.readFile(currentStatePath(stateDir), "utf8")
    return parseGoalState(JSON.parse(raw) as unknown)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

export async function saveGoalState(stateDir: string, state: GoalState) {
  state.updatedAt = new Date().toISOString()
  await fs.mkdir(stateDir, { recursive: true })
  await fs.mkdir(path.join(stateDir, "runs"), { recursive: true })
  const tmp = `${currentStatePath(stateDir)}.${process.pid}.tmp`
  await fs.writeFile(tmp, `${JSON.stringify(state, null, 2)}\n`, "utf8")
  await fs.rename(tmp, currentStatePath(stateDir))
}

export async function clearGoalState(stateDir: string) {
  try {
    await fs.rm(currentStatePath(stateDir))
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false
    throw error
  }
}

export async function writeInitialRunLog(state: GoalState) {
  await fs.mkdir(path.dirname(state.runLogPath), { recursive: true })
  await fs.writeFile(
    state.runLogPath,
    [
      `# Goal run: ${state.objective}`,
      "",
      `- Goal ID: ${state.goalId}`,
      `- Created: ${state.createdAt}`,
      `- CWD: ${state.cwd}`,
      `- Model requested: ${state.modelRequested}`,
      `- Verification: ${state.verification.command ?? "not configured"}`,
      `- Max turns: ${state.budgets.maxTurns}`,
      "",
      "## Objective",
      "",
      state.objective,
      "",
    ].join("\n"),
    "utf8"
  )
}

export async function appendRunLog(state: GoalState, markdown: string) {
  await fs.mkdir(path.dirname(state.runLogPath), { recursive: true })
  await fs.appendFile(state.runLogPath, `${markdown.replace(/\s+$/g, "")}\n\n`, "utf8")
}

export function createGoalState(command: ParsedCli, model?: ResolvedModelSummary): GoalState {
  const now = new Date().toISOString()
  const goalId = `${timestampSlug(now)}-${slugify(command.objective ?? "goal")}-${crypto.randomBytes(3).toString("hex")}`
  const stateDir = resolveStateDir(command.cwd, command.stateDir)
  const runLogPath = path.join(stateDir, "runs", `${goalId}.md`)

  return {
    schemaVersion: 1,
    goalId,
    cwd: command.cwd,
    objective: command.objective ?? "",
    status: "active",
    createdAt: now,
    updatedAt: now,
    modelRequested: command.model,
    modelResolved: model,
    tier: command.tier,
    verification: {
      command: command.verifyCommand,
      timeoutMs: command.validationTimeoutMs,
      allowDestructive: command.allowDestructive,
    },
    budgets: {
      maxTurns: command.maxTurns,
    },
    usage: {
      turnsUsed: 0,
    },
    runLogPath,
    last: {},
    history: [{ at: now, event: "goal_created", details: { objective: command.objective } }],
  }
}

export function updateGoalFromCommand(state: GoalState, command: ParsedCli, model?: ResolvedModelSummary) {
  if (command.objective) {
    state.objective = command.objective
  }
  state.status = "active"
  state.modelRequested = command.model
  if (model) state.modelResolved = model
  state.tier = command.tier
  if (command.verifyCommand) state.verification.command = command.verifyCommand
  state.verification.timeoutMs = command.validationTimeoutMs
  state.verification.allowDestructive = command.allowDestructive
  state.budgets.maxTurns = command.maxTurns
  addHistory(state, command.action === "edit" ? "goal_edited" : "goal_resumed", { objective: command.objective })
}

export function addHistory(state: GoalState, event: GoalHistoryEventName, details?: Record<string, unknown>) {
  const entry: GoalHistoryEvent = { at: new Date().toISOString(), event }
  if (details) entry.details = details
  state.history.push(entry)
  state.history = state.history.slice(-200)
}

export function setGoalStatus(state: GoalState, status: GoalLifecycleStatus, reason?: string) {
  state.status = status
  if (reason) state.last.reason = reason
  addHistory(state, `goal_${status}`, reason ? { reason } : undefined)
}

export function formatGoalStatus(state: GoalState | null) {
  if (!state) return "No active goal."

  const validation = state.last.validation
  const model = state.modelResolved?.label ?? state.modelRequested
  const changedFiles = state.last.filesChanged?.length ? state.last.filesChanged.join(", ") : "none recorded"

  return [
    `Goal: ${state.status}`,
    `Objective: ${state.objective}`,
    `Model: ${model}`,
    `Turns: ${state.usage.turnsUsed}/${state.budgets.maxTurns}`,
    `Verification: ${state.verification.command ?? "not configured"}`,
    validation ? `Last validation: ${validation.ok ? "passed" : "failed"}${validation.exitCode !== undefined ? ` (exit ${validation.exitCode})` : ""}` : "Last validation: none",
    `Changed files: ${changedFiles}`,
    `Run log: ${state.runLogPath}`,
    state.last.reason ? `Reason: ${state.last.reason}` : undefined,
  ]
    .filter(Boolean)
    .join("\n")
}

export function validationMarkdown(result: ValidationResult) {
  if (result.skipped) {
    return `Verification skipped: ${result.reason ?? "no command configured"}`
  }

  return [
    `Verification command: \`${result.command}\``,
    `Result: ${result.ok ? "pass" : "fail"}${result.exitCode !== undefined ? ` (exit ${result.exitCode})` : ""}`,
    `Duration: ${result.durationMs}ms`,
    result.stdout ? `\nstdout:\n\`\`\`\n${truncateText(result.stdout, 12_000)}\n\`\`\`` : undefined,
    result.stderr ? `\nstderr:\n\`\`\`\n${truncateText(result.stderr, 12_000)}\n\`\`\`` : undefined,
  ]
    .filter(Boolean)
    .join("\n")
}

function timestampSlug(iso: string) {
  return iso.replace(/[:.]/g, "-")
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "goal"
}
