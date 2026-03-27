# Contributing (python)

## Setup

```bash
cd python
python -m pip install -e .[dev]
```

## Test

```bash
python -m pytest
```

## Guidelines

- keep package boundaries aligned with `core/`
- keep source contracts in `src/contextrie/types`
- keep agent implementations in `src/contextrie/agents`
- avoid filesystem and network IO abstractions in the package surface
