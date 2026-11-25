---
description: Wave CXM environments and safety rules — which connector is production, which is stage, why an empty result is ambiguous, and the guard that applies before any write.
---

# Wave CXM Environments

Two MCP connectors reach Wave CXM, and the connector *is* the environment:

| Connector | Environment | Surface |
|:----------|:------------|:--------|
| `wave-cxm` | production | reads only — the write tools do not exist here |
| `wave-cxm-stage` | stage | reads, writes, and the user guide |

The environment is carried in every tool name — `mcp__wave-cxm__query` versus `mcp__wave-cxm-stage__query` — so it is visible on every call.

## Never infer the environment from a tenant

**A `tenantId` does not identify an environment.** The same tenant id can exist on both connectors, pointing at entirely different data. Only the connector disambiguates.

Never infer an environment from an id, a tenant name, or surrounding context. Never assume a tenant exists on both sides — resolve tenants per connector with `list_tenants`, every time. And never report a fact without naming the environment it came from.

## Production cannot be written to

Not as a matter of policy or caution: the write tools are absent from the production connector. If asked to create, update or delete on production, say so plainly and offer stage. There is nothing to override.

## An empty result is ambiguous

An empty result means **either** there are no matching records **or** your role cannot see that record type. Permissions differ from tenant to tenant, so this is not a rare edge case.

Before reporting that something does not exist, check the relevant `X:View*` entry in that tenant's permission list from `list_tenants`, and state which of the two it was. "This tenant has no shops" and "you cannot view shops in this tenant" send someone to completely different places.

## Before any write

1. `describe_write(type, operation)` first — never guess a payload, and never adapt one from another type.
2. Echo the connector, the tenant name **and** id, the entity type, the operation, and every field being set or changed. Wait for approval.
3. `update_entity` sends only the fields that change.
4. `delete_entity` needs explicit human confirmation **and** `confirm: true`. It fails closed without the flag — that is the design.
5. Read the entity back afterwards, note whether it is active, and link it with `get_url` — with the tenant printed beside the link, because the link resolves against whichever tenant the reader is switched into.

Writes ride the caller's bearer token, so the gateway enforces permissions, validation, lifecycle and audit exactly as the admin panel does. The guard above exists to make a change legible before it happens, not to duplicate those checks.

## Why this file exists

It restates a subset of the `wave-cxm-context` skill on purpose. An ambient rules slot is flat and has no notion of a non-user-invocable skill, so that skill's description — which says it is used internally by other skills — cannot serve as a trigger here. This file carries the safety-critical part with a description that fires on Wave CXM work.

For the full access patterns, including the guided discovery order, association-graph handling and the tool-specific traps, use the `wave-cxm-context` skill.
