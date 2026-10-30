---
name: plan-to-issues
description: Split this repo's plan.md into GitHub issues with gh, one per unit of work, after a human has reviewed the split. Use when a plan is ready and has no issues yet.
---

# plan-to-issues

Turns `plan.md` into GitHub issues that workers can pick up cold. Easiest with `gh`, authenticated,
in a shell this agent can run.

## Steps

1. Read `plan.md`, `AGENTS.md` and `docs/adr/`.
2. Draft the split as a table: title · plan section · scope · done when · blocked by.
   One issue per unit of work.
3. **Stop and show the table to the human.** Publish nothing until they approve it.
4. Ask the human what every issue here must carry (fields, labels, wording), unless it is
   already written down in this session or in the repo. It is: see "What every issue carries".
   Ask only about anything more.
5. Create each issue in dependency order, so blocked-by can cite real numbers:

   ```sh
   gh issue create --title "<title>" --body-file <tmp.md> --label plan:<plan>
   ```

6. Record every issue URL from gh's output (not from memory) and reply with the list.

Closing one, with the closing comment from AGENTS.md:

```sh
gh issue close <n> -c "<closing comment>"
```

A `closes #n` commit pushed to the default branch closes the issue with no closing comment: add
it right after the push (`gh issue comment <n>`).

## What every issue carries

Set by a human on 2026-10-30 (plan morning-digest). The reviewer sorts issues by the first line
and the label, so both are exact.

- Label `plan:<plan>`, the `plan:` value from `plan.md`'s frontmatter (create it once with
  `gh label create`).
- Body, in this order:

  ```md
  Source: plan.md § <n>

  ## Scope
  <what this issue changes, and what it must not touch>

  ## Done when
  <the plan's "Done when", word for word>

  ## Blocked by
  <#n, #m, or —; name a person when it waits on one, e.g. "the reviewer's review">

  ## Model
  <strongest | cheaper | —>
  ```

`§ <n>` is the plan's section number as written: `1`, `2a`, `3`. Two issues from one section both
cite it.

## No `gh`

Steps 1–4 hold either way. GitHub reachable another way (a connector, the REST API, the web UI):
the same issues, made that way. GitHub issues out of reach altogether: write them as files in
`docs/issues/`, format in ADR 0004, then commit and push.

## Don'ts

- Don't paste the whole plan into one issue, and don't keep issues only in chat.
- Don't invent sections the plan doesn't have. If the plan is unclear, ask.
