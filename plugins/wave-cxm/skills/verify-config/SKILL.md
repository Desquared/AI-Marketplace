---
name: verify-config
description: Use when checking whether a Wave CXM campaign, rule, reward scheme, coupon group or contest is configured as intended before it goes live — prospective configuration review, not diagnosing a live failure.
---

# Verify Wave CXM Configuration

Confirm a piece of configuration matches its intent **before** it reaches customers. Configuration that is internally valid but wrong is the failure this skill exists to catch: conditions that are not what someone meant, an audience that is not who they had in mind, a scheme with nothing attached to it.

Use the `wave-cxm-context` skill first for connector selection, tenant resolution, the empty-result rule, and how to read an association graph.

**This skill never writes**, on either connector. To change configuration, use `author-config` on stage.

## Discriminator

This skill is **prospective** and inspects **configuration only**. If the question is "why isn't this working" — something already ran and misbehaved — use `diagnose-issue` instead, which reads evidence of what actually happened. If no specific entity is named and the ask is orientation, use `tenant-map`.

## Output header

Begin every report with the connector and the tenant:

```
Environment: production (wave-cxm) · Tenant: Acme (64f0c2a1b3d4e5f6a7b8c9d0)
```

## Procedure

1. **Resolve the target.** `resolve-entity` accepts an admin-panel URL, a name, or a reference. A URL resolves to exactly one `{type, id}`; a name returns candidates to disambiguate — ask rather than picking one.
2. **Read it.** `get-entity` for the full record.
3. **Walk what it touches.** `get-associations`, deduplicated per the context skill. Render the graph once from the root.
4. **Check every node** for `status` and `archived`, not just the root. A live rule pointing at an archived coupon group is a broken rule.
5. **Run the checklist below** against what you found.
6. **Report** as ranked findings.

## Checklist

Each of these is a real trap the platform documents against itself. Check the ones that apply to the entity types in the graph.

### Reward schemes and rules

- **A live reward scheme with no active rules.** Nothing earns it. Flag any `ACTIVE` scheme whose attached rules are all `INACTIVE` or `EXPIRED`.
- **Rules still `INACTIVE` that were meant to be live.** Every new rule starts inactive and must be activated explicitly. A rule created for a launch and never activated is the single most common miss.
- **Benefit and scheme-type mismatches.** The benefit types a rule may grant depend on which scheme types the tenant owns and on the rule's event:
  - Currency benefits need a **non-Instant** scheme.
  - Coupons, coupon redemptions, discount-vault refills, contests, products, services and mini-games all need an **Instant** scheme.
  - Fixed and percentage discounts need an **Instant** scheme **and** a Purchase or Bill-payment event.
- **Rate benefits with no cap** where one was intended — `maxAmount` omitted on a `REWARD_SCHEME_CURRENCY_RATE` is unbounded earning.
- **An empty condition group.** A group holding zero conditions is **not inert**: it still routes item aggregation down the filtering path, which fails the event check, so the rule silently never applies. A rule with `conditions: null` is fine — a rule with a condition group containing an empty `conditions` or `filters` array is broken. Check the difference.
- **An active rule that has never applied.** `timesApplied: 0` and `stats.total: 0` on a rule that has been `ACTIVE` for a meaningful stretch is the strongest single signal that something upstream is wrong — the event never arrives, conditions never match, or another rule blocks it exclusively. Not proof of a fault, but always worth reporting with the rule's `createdAt`.
- **Blocking and exclusivity that silences a rule.** Check `blocks`, `blockedBy` and `exclusive` across the rules attached to the same event. An exclusive rule that wins every time makes its neighbours dead code.

### Contests

- **A speed contest whose highest prize position does not equal its total participations.** In a speed contest every entry takes the next winning position, so every participation slot is a prize slot. The platform's own check only runs *once prizes are configured* — a speed contest saved with no prizes escapes validation entirely and will hand out nothing.
- **Winning positions with no prize behind them.** The admin panel refuses to save this; the API does not. Anything created through the API can carry unassigned positions.
- **A draw contest whose draw date equals its end date.** Rejected — the draw date must fall strictly after the end date.
- **A runners-up deadline too close to the confirmation window.** Runners-up are promoted on a schedule and promotion stops at the "assign runners-up up to date" deadline. If that deadline lands while winners are still inside their `Days for confirmation` window, declined prizes go unclaimed and the reserve list never does its job.
- **A draw contest that has passed its draw date with no draw run.** The date only makes the draw *possible*; an administrator still has to run it, once, irreversibly.

### Coupons

- **Availability read across all four flags plus the group's status.** A coupon carries a `status`, an `enabled` flag, a record of manual disabling, and an archived flag — and the group has its own status on top. A coupon can be unusable for a reason not visible on the coupon itself. Report which flag blocks it.
- **A group treated as exhaustible when it is not**, or the reverse. When a pool runs dry the platform closes further hand-outs only for groups it considers exhaustible; the group stays `ACTIVE` and already-issued coupons stay redeemable.

### Mini-games

- **LUCK branch weights are out of 10,000, not 100.** A branch set to `50` wins once in 200 sessions, not half of them. This is the most misread number in the platform — check it against intent every time.
- **A complimentary branch carrying unintended weight.** Its odds are derived: whatever remains of 10,000 after the configured branches are subtracted. Large leftover weight means most sessions land there.
- **A game still in `Draft`.** A new game is created as Draft and only becomes activatable once customised.

### Referrals

- **A single-step programme rewarding sign-up alone.** It pays out for every account created. Advisory, not an error — but say it, because adding a purchase step is what protects a programme from being gamed.
- **Benefit slots left empty.** A two-step programme rewarding both roles has four slots; any may legitimately be blank, so confirm intent rather than flagging blindly.

### Notifications and delivery

- **Notification rules pointing at stale webhook configurations or integrations.** Check that each referenced endpoint still exists and is active.
- **A notification configured for SMS.** SMS is not implemented — dispatching by that method is rejected. It can only leave the platform through a webhook.

## Output

Report as **ranked findings**, most consequential first. For each:

- what is wrong
- why it matters, in one sentence, in terms of what customers will or will not receive
- the `get_url` link, with the tenant printed beside it

Then two closing sections, both explicit:

- **Verified correct** — what you checked and found sound. A verification that only lists problems leaves the reader unsure what was covered.
- **Could not verify** — every check you could not run, and why. Where the reason is a missing permission, name the permission. Per the empty-result rule, never let a permission gap read as a clean result.

If the configuration is sound, say so plainly and list what was checked.
