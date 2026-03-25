# benchmarks

> Brief benchmark scope for evaluating agent coding workflows with and without Contextrie.

## Status

Planned. This directory defines the benchmark direction. It does not yet ship a runnable harness.

## What this is

`benchmarks` is the repo place for defining how Contextrie should be evaluated against generic agent coding workflows.

The initial comparison is the same tool in two modes:

- baseline tool usage
- the same tool with Contextrie managing context

Initial tools:

- Codex
- Claude Code
- OpenClaw
- OpenCode

## Goal

Measure two things:

- efficacy: task completion, output quality, and correctness
- efficiency: token usage, latency, and context footprint

This is not meant to be a leaderboard. It is meant to show whether Contextrie helps realistic agent work, and at what cost.

## Protocol

- use the same task
- use the same repo snapshot
- use the same model where realistically possible
- report model differences when parity is not possible
- compare baseline and `+contextrie` as paired runs
- compare efficiency and efficacy together

For the first benchmark shape, each task runs in four modes:

- Codex
- Codex + Contextrie
- OpenCode
- OpenCode + Contextrie

Each run should start from a fresh session and fresh repo worktree so thread history and prior file changes do not leak across runs.

For `+contextrie` runs, the agent prompt stays the same, but Contextrie prepares a curated context bundle first and that bundle is injected ahead of the task prompt.

## Metrics to capture

- success
- correctness
- quality
- tokens
- latency
- context volume
- judge rationale

Minimum capture for the first runnable harness:

- wall-clock time from prompt submit to final diff
- final diff or patch
- pass or fail
- optional token counts when the tool exposes them

## Judging

Use Codex as the first judge on final diffs.

- judge against the original task and one fixed rubric
- blind the diffs so the judge does not know which mode produced them
- keep judging separate from generation runs
