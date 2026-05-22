import test from "node:test"
import assert from "node:assert/strict"
import { resolveModelLabel } from "../src/state.js"

test("records model label without SDK lookup", () => {
  const resolved = resolveModelLabel("composer-2.5", "auto")
  assert.equal(resolved.label, "composer-2.5")
  assert.equal(resolved.warnings.length, 0)
})
