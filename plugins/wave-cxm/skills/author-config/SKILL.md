---
name: author-config
description: Use when creating, updating or deleting Wave CXM configuration — rules, reward schemes, redemption options, coupon groups, contests and more — on the stage environment.
---

# Author Wave CXM Configuration

Build and adjust configuration by conversation instead of clicking through screens. Changes go through the same permission checks, validation, lifecycle and audit as a change made by hand in the admin panel.

Use the `wave-cxm-context` skill first, and its write guard in particular.

## Hard precondition: stage only

This skill operates on the **`wave-cxm-stage`** connector.

The production connector exposes no write tools at all. If asked to create, update or delete on production, say plainly that the write tools do not exist on the production connector, and offer to do it on stage. Do not frame this as a policy you are enforcing or a risk you are declining — it is what the surface is. There is nothing to override.

Because a tenant id does not identify an environment, confirm you are on stage from the **connector**, never from the tenant.

## Output header

Every step of an authoring session states where it is happening:

```
Environment: stage (wave-cxm-stage) · Tenant: Acme (64f0c2a1b3d4e5f6a7b8c9d0)
```

## Procedure

### 1. Confirm the tenant

`list_tenants` on the stage connector. Echo name and id, and say the word "stage" out loud in your confirmation. If more than one tenant is available, ask which — never infer.

### 2. Learn the payload

`describe_write(type, operation)` before drafting anything. It returns the field names, types, required flags, enums and descriptions for that operation.

- Never guess a payload.
- Never adapt a payload from a different entity type — the shapes differ in ways that validate but behave wrongly.
- Read the allow-list from `describe_write` rather than assuming it. A type outside it fails closed with no gateway call at all.

For an `update`, read the entity first with `get-entity` so you know what you are changing from.

### 3. Draft and echo for approval

Present the intended change and **wait for explicit human approval before writing**. The echo names:

- the connector and the environment
- the tenant name and id
- the entity type and the operation
- for a create, every field being set
- for an update, only the fields changing, each as `before → after`
- for a delete, what will be removed and what depends on it — run `get-associations` first and say what else references it

Show the payload as JSON. A reader who cannot see the payload cannot approve it meaningfully.

### 4. Write

- **`create_entity`** — a full payload.
- **`update_entity`** — a partial patch carrying **only the fields that change**. Sending unchanged fields risks overwriting concurrent edits.
- **`delete_entity`** — requires `confirm: true` and only after explicit human confirmation. It fails closed without the flag; that is the design, not a bug to work around.

One entity at a time. If a task needs several changes, do them in sequence with an echo before each, rather than batching them past the reader.

### 5. Read back and link

`get-entity` on what you just wrote, and `get_url` for the link — with the tenant printed beside it, since the link resolves against whichever tenant the reader is switched into.

Read-back is not ceremony. It confirms what the gateway actually stored, which is not always what you sent: defaults get applied, rates resolve to amounts, and a new record starts in a lifecycle state you did not specify. Report what came back, and flag any difference from what you sent.

Note the lifecycle state explicitly. Most configuration is created **inactive** and does nothing until activated — a rule, a contest, a referral program all start that way. Say whether the thing you just built is live, and say how to activate it if not.

### 6. Offer verification

Offer to run `verify-config` on what was built. Authoring confirms the record saved; verification confirms it will behave as intended. They are different questions, and the second is the one that matters before anything reaches customers.

## What this skill does not do

- It adds **no second safety layer**. Writes ride the caller's bearer token, so the gateway enforces permissions, validation, lifecycle and audit exactly as it does for the admin panel. This skill's job is to make the change legible before it happens, not to re-implement those checks or imply it has.
- It does not touch balances, ledgers, customer personal data, or access and role settings. Those are outside the write allow-list and always will be.
- It does not write on production.
