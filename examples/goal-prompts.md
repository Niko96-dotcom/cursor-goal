# Example goals

Install the CLI and skill first: [`docs/install.md`](../docs/install.md).

Use these with `cursor-goal` from the terminal, or paste the objective into Cursor as `/goal <objective>`.

## Bug fix

```bash
cursor-goal "Make the auth test suite pass on the current branch without changing public API behavior. Verify with npm test -- auth. If blocked by missing credentials or fixtures, stop with the exact missing input." \
  --verify "npm test -- auth" \
  --max-turns 8
```

## Migration

```bash
cursor-goal "Migrate the data-access layer from callbacks to async/await while preserving existing behavior. Verify with npm test and npm run typecheck. Limit changes to src/data and related tests. Between checkpoints, record what changed and what still needs migration." \
  --verify "npm test && npm run typecheck" \
  --max-turns 12
```

## Performance

```bash
cursor-goal "Reduce p95 checkout latency below 120 ms, verified by npm run bench:checkout, while keeping the correctness suite green. Use only checkout service code, benchmark fixtures, and related tests. If no valid optimization path remains, stop with the evidence and next input needed." \
  --verify "npm run bench:checkout && npm test" \
  --max-turns 12
```

## Research artifact

```bash
cursor-goal "Produce an evidence-backed audit of whether the retry subsystem can safely move to exponential backoff. Inspect source, tests, logs, and docs. End with docs/retry-backoff-audit.md that separates confirmed facts, risks, unknowns, and recommended next steps." \
  --verify "test -f docs/retry-backoff-audit.md" \
  --max-turns 6
```
