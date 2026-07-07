# CoalCode

CoalCode is a local fork of opencode with COAL integration points for code cognition.

This fork is not affiliated with the OpenCode team.

## Cold Coal

Cold Coal is persistent, offline codebase context. CoalCode injects it into the
system prompt at session preparation time when any of these files exist in the
workspace root:

- `.coal/cold.md`
- `.coal/cold.json`
- `COAL.md`
- `coal.md`

The injected block is bounded to keep context usage predictable. Disable this
with:

```bash
COALCODE_COLD_DISABLED=1 coalcode
```

## Hot Coal

Hot Coal is live runtime observability. CoalCode records session, reasoning,
step, and tool events to:

- `.coal/hot/events.jsonl`
- `.coal/hot/state.json`

`events.jsonl` is append-only session telemetry. `state.json` contains the most
recent event for lightweight dashboards, watchers, or editor integrations.

Disable this with:

```bash
COALCODE_HOT_DISABLED=1 coalcode
```

## Current Event Types

- `step-start`
- `step-finish`
- `reasoning-start`
- `tool-call`
- `tool-result`
- `tool-error`

## Next Integration Targets

- Cold Coal compiler command to produce `.coal/cold.json` from repository scans.
- Coal status tool for asking the agent what Cold/Hot context is active.
- TUI status surface for current Hot Coal state.
