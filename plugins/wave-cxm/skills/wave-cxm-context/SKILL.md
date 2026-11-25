---
name: wave-cxm-context
description: Shared Wave CXM MCP access patterns — connector and environment selection, tenant resolution, the guided discovery order, the empty-result rule, and the stage write guard. Non-user-invocable; used internally by other Wave CXM skills.
user-invocable: false
---

# Wave CXM Context

This skill is the single source of truth for all Wave CXM MCP access. It is used by other skills — not invoked directly by users.

## Overriding principle: derive, never hardcode

Every inventory comes from the live connector at the moment you need it:

| What you need | Where it comes from |
|:--------------|:--------------------|
| Tenants you may act on, and your permissions in each | `list_tenants` |
| Queryable entity types and their root operations | `list-entities` |
| A type's fields, enums, and filter shape | `describe-entity` |
| Which types accept writes, and the payload for each | `describe_write` |
| Which event types can be dry-run, and their body | `describe-preview` |

Never state an entity type, a write allow-list, a tenant, or a permission from memory. The connector is under active development: anything baked into a skill starts rotting the day it lands. **A skill that asks is better than a skill that confidently reports a stale list.**

## 1. Environment model

Two connectors, and the connector *is* the environment:

| Connector | Environment | Surface |
|:----------|:------------|:--------|
| `wave-cxm` | production | reads only — the write tools do not exist here |
| `wave-cxm-stage` | stage | reads, writes, and the user guide |

The environment is carried in every tool name — `mcp__wave-cxm__query` versus `mcp__wave-cxm-stage__query` — so it is visible on every call. Use that.

Four rules follow:

- **A `tenantId` never identifies an environment.** The same tenant id can exist on both connectors, pointing at entirely different data. Only the connector disambiguates. Never infer an environment from an id, a tenant name, or context.
- **Production cannot be written to because the write tools do not exist there.** Say it that way. It is not a policy this skill enforces, or a risk to be weighed — the tools are absent. If asked to write on production, say so plainly and offer stage.
- **No fact may be reported without naming the environment it came from.** Every answer states its connector. When an answer draws on both, label each fact.
- **Never assume a tenant exists on both sides.** Resolve tenants per connector, every time.

## 2. Guided discovery order

Follow this order. Skipping it is precisely when queries fail:

```
list_tenants  →  list-entities  →  describe-entity  →  query
```

- Call `describe-entity` with `includeFilter: true` **before** building any `FindMany` filter.
- Prefer `describe-entity` over raw GraphQL `__schema` / `__type` introspection.
- Use `get-entity` for a known `{type, id}`. Use `query` for anything shaped — filters, projections, multiple types at once.
- **Batch `*Count` fields into a single GraphQL document** rather than issuing one call per type. One document carrying eight counts is one round trip; eight calls are eight.

## 3. Tenant resolution

Every read and write tool takes a `tenantId`. `get_url` is the sole exception and takes none.

1. Call `list_tenants` first.
2. Echo both the tenant **name** and **id** in your output — an id alone is unreadable, a name alone is ambiguous.
3. If the user named a tenant, map it to its id and confirm.
4. If more than one tenant could match, or none was named and more than one is available, **ask**. Never guess which tenant someone meant.

## 4. The empty-result rule

An empty result means **either** there are no matching records **or** your role cannot see that record type. These are indistinguishable from the result alone, and permissions genuinely differ from tenant to tenant.

Before reporting that something does not exist:

1. Check the relevant `X:View*` entry in this tenant's permission list from `list_tenants`.
2. Report which of the two it was.

Never say "this tenant has no shops" when the tenant simply lacks `Shop:View`. Say "you do not have permission to view shops in this tenant" instead. The two statements send someone to completely different places.

### A partial GraphQL result is the same trap, wearing a disguise

A batched query **succeeds partially**. Denied fields come back `null` inside `data`, alongside an `errors` array naming the missing permission — the rest of the document returns real values:

```json
{
  "errors": [{ "message": "Missing Notification.ViewNotificationRecords permission.",
               "path": ["NotificationRecordCount"] }],
  "data": { "RuleApplicationCount": 72, "NotificationRecordCount": null }
}
```

**Always inspect `errors`, never just `data`.** A `null` with a matching entry in `errors` is a permission denial. A `0` is a real zero. Reporting that null as "0 notification records" is exactly the false statement this rule exists to prevent — and it is easier to make here than anywhere else, because the response looks successful.

Report denied fields as denied, name the permission, and keep the fields that did return.

**Permission names are spelled two ways.** `list_tenants` returns them colon-separated (`Notification:ViewNotificationRecords`); GraphQL errors report the same permission dot-separated (`Notification.ViewNotificationRecords`). Normalise the separator before comparing the two, or a permission you hold will look absent.

## 5. Linking

Whenever you name a specific entity, call `get_url` and present the link beside it. This is the connector's own instruction and it is worth honouring — it turns an answer into something actionable.

Two caveats:

- `get_url` takes no `tenantId`. The link resolves against whichever tenant the reader is currently switched into in the admin panel. **Always print the tenant beside the link**, so a reader in the wrong tenant notices before they act.
- Not every type has an admin-panel page. When `get_url` errors, report the entity without a link rather than dropping the entity.

## 6. Reading the association graph

`get-associations` returns a flat edge list **and** a nested tree, and both are redundant: every relationship appears in both directions, and the tree revisits nodes as their own descendants. A rule with four real relationships can produce eight edges and a tree that walks the same coupon group three times.

Before presenting it:

- Collapse to unique pairs.
- Render once, as a tree from the root.
- Never re-walk a node already shown; reference it instead.
- Check `truncated` and say so when it is true — a capped graph is not a complete one.

## 7. Write guard — stage only

Before any `create_entity`, `update_entity`, or `delete_entity`:

1. **Call `describe_write(type, operation)` first.** Never guess a payload, and never adapt one from a different type.
2. **Echo the intent for human approval** — the connector, the tenant name *and* id, the entity type, the operation, and every field being set or changed.
3. `update_entity` sends **only the fields that change**. It is a partial patch, not a replacement.
4. `delete_entity` requires explicit human confirmation **and** `confirm: true`. It fails closed without the flag — do not treat that failure as a bug.
5. **Read the entity back** with `get-entity` afterwards and link it.
6. **On production, do not attempt it.** The tools do not exist. Say so and offer stage.

A type outside the allow-list fails closed with no gateway call at all. Read the allow-list from `describe_write` rather than assuming it.

Writes ride the caller's bearer token, so the gateway enforces permissions, validation, lifecycle and audit exactly as the admin panel does. This skill adds no second layer and should not imply one — its job is to make the change legible before it happens.

## 8. Gated and redacted data

**Redaction is not absence.** Several types deliberately redact personally-identifiable fields from the MCP view — among them `Customer`, `BaseEvent`, `NotificationRecord`, `ChallengeParticipation`, and `AttributeValue`'s raw stored values. `list-entities` states which. When a field is redacted, say it is redacted and point at the admin panel. Never work around redaction, and never report a redacted field as empty or missing.

Tool-specific traps that produce confidently wrong answers if ignored:

- **`check-entity`'s `customerId` is the tenant-facing external id — not the Wave `_id` / `waveCustomerId`.** Passing an `_id` reports a perfectly real customer as not found. Unlike an event body, which accepts several identifier shapes, every check endpoint resolves this field as the external id only.
- **`check-entity` evaluates ACTIVE entities only.** "Not found" therefore means "no such id **or** the entity is not active". Read the entity back before concluding the id is wrong.
- **The coupon check is context-free** — no basket items, no shop. A coupon whose conditions depend on a purchase will report those conditions as unmet. Report that as a limit of the check, not as broken configuration.
- **`ATTRIBUTE_VALUE_GROUP` with `eligible: false`** cannot distinguish a value genuinely outside the group from an unrecognised configuration or group key. Verify the keys before treating the negative as meaningful.
- **`preview-event` forces `checkOnly: true` and persists nothing.** Call `describe-preview` first to learn the body. It requires the matching `Create*Events` permission for that event type, and not every event type can be dry-run.
- **`audit-entity` returns the *names* of changed fields, not before/after values**, and requires `User:ViewUserEvents`. For full detail, direct the reader to the admin panel.
- **The user-guide tools exist on the stage connector only.** Use them for "how do I…" product questions rather than guessing platform behaviour.

## 9. Error handling

| Situation | Response |
|:----------|:---------|
| Connector not configured or unauthorized | Name the connector. Say sign-in must be completed in an interactive session. Never ask the user for tokens, codes, or callback URLs. |
| `list_tenants` returns empty | No tenant grants on this environment, or the wrong account is signed in. Do **not** silently fall back to the other connector. |
| `Unauthorized` mid-session | The sign-in expired or was revoked. Ask the user to re-authenticate the connector. Report the error verbatim. |
| Empty query result | Apply the empty-result rule (§4) and state which of the two it was. |
| `describe_write` rejects a type | It is not on the allow-list; the call fails closed with no gateway request. Say so, and name what is allowed from `describe_write`. |
| `get_url` errors | The type has no admin-panel page. Report the entity without a link. |
| User-guide tool unavailable | Those tools exist on the stage connector only. |
| Any other MCP error | Report it verbatim. Never retry silently, and never paper over it with a guess. |
