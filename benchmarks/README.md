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

## Metrics to capture

- success
- correctness
- quality
- tokens
- latency
- context volume
- judge rationale
