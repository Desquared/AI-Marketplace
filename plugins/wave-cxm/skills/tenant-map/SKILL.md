---
name: tenant-map
description: Use when getting oriented in an unfamiliar Wave CXM tenant — counts by entity type, what is active, what changed recently, and what your permissions hide.
---

# Map a Wave CXM Tenant

Produce a one-page picture of a tenant: what exists, how much of it is live, what changed recently, and — crucially — what you cannot see.

Use the `wave-cxm-context` skill first for connector selection, tenant resolution, and the empty-result rule. The empty-result rule is load-bearing here: a map that silently omits what you lack permission for is worse than no map, because it looks complete.

## Discriminator

This skill covers **breadth** and takes **no specific entity**. If a particular rule, contest or coupon group is named, use `verify-config` (is it right?) or `diagnose-issue` (why did it misbehave?) instead.

## Output header

```
Environment: production (wave-cxm) · Tenant: Acme (64f0c2a1b3d4e5f6a7b8c9d0)
```

When the named tenant exists on both connectors — which happens, since a tenant id is not unique to an environment — state explicitly which connector this map describes, and offer to map the other.

## Procedure

### 1. Resolve the tenant

`list_tenants`. Echo the name and id. If more than one tenant is available and none was named, list them and ask — do not map an arbitrary one.

Keep the permission list from this call. Step 4 depends on it.

### 2. Discover what is queryable

`list-entities`. This returns the entity types available in this tenant with their root operations. **Derive the field list for step 3 from this response**, never from memory — the set of types changes as the connector develops.

Note also which type descriptions mention redacted fields; the map should say when a type is visible but partially redacted.

### 3. Count in one call

Issue a **single** GraphQL document carrying every relevant `*Count` field. One document is one round trip; one call per type is dozens.

```graphql
query {
  RuleCount
  RewardSchemeCount
  RedemptionOptionCount
  CouponGroupCount
  ContestCount
  MiniGameCount
  QuestionnaireTemplateCount
  CampaignCount
  NotificationRuleCount
  ReferralProgramCount
  CustomerGroupCount
  PartnerCount
  ShopCount
}
```

Treat that as a shape, not a list to copy — build the actual field set from `list-entities`.

For the configuration types that carry a lifecycle, follow up with active-versus-total. A count of 14 coupon groups means little; 3 active of 14 tells a story:

```graphql
query {
  RuleCount
  ActiveRules: RuleCount(filter: { status: ACTIVE })
}
```

Call `describe-entity` with `includeFilter: true` before building any such filter — the filter shape and the enum values both come from there.

### 4. Find what changed recently

Query the main configuration types sorted by `updatedAt` descending, limited to a handful each, and report the most recently touched active items. This is the fastest way to see what someone has been working on.

### 5. Establish what you cannot see

Compare the permission list from step 1 against the entity types from step 2. Every type whose `X:View*` permission is absent goes in the closing section.

## Output

1. **Counts** — a table of entity type, total, and active where a lifecycle applies.
2. **Recently updated** — the most recently touched active items, with `get_url` links and the tenant printed beside them.
3. **Shape notes** — one or two sentences on what the numbers imply. Several reward schemes running at once, a large coupon estate with few active groups, contests but no mini-games: say what the tenant appears to be doing, since that is what a newcomer actually wants.
4. **Not visible to you here** — every entity type this role cannot view, and every type that is viewable but redacts fields.

That last section is **the point of this skill, not a caveat**. A newcomer cannot discover their own permission gaps any other way: everything they lack simply returns empty, indistinguishable from a tenant that genuinely has none. Name the missing permission for each, so the reader knows what to request and from whom.

If the tenant is empty of something genuinely — permission held, count zero — say that explicitly too. "You can see rules; there are none" and "you cannot see rules" must never render the same way.
