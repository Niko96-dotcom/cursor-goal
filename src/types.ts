export const GOAL_OBJECTIVE_MAX_LENGTH = 4000
export const DEFAULT_MODEL = "composer-2.5"
export const DEFAULT_MAX_TURNS = 8
export const DEFAULT_VALIDATION_TIMEOUT_MS = 300_000

export type GoalLifecycleStatus =
  | "active"
  | "paused"
  | "complete"
  | "blocked"
  | "budget_limited"

export type GoalDecisionStatus = "complete" | "continue" | "blocked"

export type GoalAction =
  | "status"
  | "set"
  | "pause"
  | "resume"
  | "clear"
  | "edit"
  | "checkpoint"
  | "prompt"
  | "help"
  | "version"

export type ModelTier = "auto" | "fast" | "standard"

export type ResolvedModelSummary = {
  requested: string
  label: string
  warnings: string[]
}

export type ValidationConfig = {
  command?: string
  timeoutMs: number
  allowDestructive: boolean
}

export type ValidationResult = {
  command?: string
  ok: boolean
  skipped: boolean
  exitCode?: number | null
  signal?: string | null
  durationMs: number
  stdout: string
  stderr: string
  reason?: string
}

export type GoalDecision = {
  status: GoalDecisionStatus
  reason: string
  rawStatus?: string
}

export type GoalBudgets = {
  maxTurns: number
}

export type GoalUsage = {
  turnsUsed: number
}

export type GoalHistoryEventName =
  | `goal_${GoalLifecycleStatus}`
  | "goal_created"
  | "goal_edited"
  | "goal_resumed"
  | "completion_rejected_by_validation"
  | "goal_continues"
  | "working_tree_dirty_at_start"

export type GoalHistoryEvent = {
  at: string
  event: GoalHistoryEventName
  details?: Record<string, unknown>
}

export type GoalState = {
  schemaVersion: 1
  goalId: string
  cwd: string
  objective: string
  status: GoalLifecycleStatus
  createdAt: string
  updatedAt: string
  modelRequested: string
  modelResolved?: ResolvedModelSummary
  /** Audit/metadata only; does not select the Cursor chat model (see resolveModelLabel in state). */
  tier: ModelTier
  verification: ValidationConfig
  budgets: GoalBudgets
  usage: GoalUsage
  runLogPath: string
  last: {
    decision?: GoalDecision
    validation?: ValidationResult
    assistantTail?: string
    filesChanged?: string[]
    toolCallCount?: number
    reason?: string
  }
  history: GoalHistoryEvent[]
}

export type ParsedCli = {
  action: GoalAction
  objective?: string
  verifyCommand?: string
  model: string
  tier: ModelTier
  cwd: string
  stateDir?: string
  maxTurns: number
  validationTimeoutMs: number
  allowDestructive: boolean
  once: boolean
  json: boolean
  assistantFile?: string
  toolCalls?: number
}

export type CheckpointOutcome = {
  decision: GoalDecision
  toolCallCount: number
}

export type PostCheckpointOptions = {
  once: boolean
}
