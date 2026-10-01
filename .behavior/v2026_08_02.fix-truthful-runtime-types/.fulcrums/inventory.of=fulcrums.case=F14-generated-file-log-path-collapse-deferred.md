# F14 — defer the `..` collapse in the generated-file log path

| field | value |
| --- | --- |
| **case** | F14 |
| **title** | defer the `..` collapse in `saveCode`'s printed path |
| **rework** | dirty → clean — the block was a credential, and it expired |
| **status** | closed — repaired 2026-09-17 |
| **confidence** | 94% at the grade; the 6% settled by the resnap |
| **caught** | 2026-09-17, `has-ergonomics-validated` self-review, stone `5.3.verification` |

## .the fork

`saveCode.ts` printed each path with a `/` strip and no `..` collapse, so 13 success lines read
`provision/schema/declarations/../sql/views/view_carriage_hydrated.sql`. the same defect class had
just been repaired in the cli (a `/./` in the resolved config path), so the honest read was that
this should ride along.

- SAFE ✅ — one log string; `absoluteFilePath` untouched, so no file moves
- CLEAN 🔴 — the path is pinned in `generate.acceptance.test.ts.snap`, and the resnap failed:
  `keyrack unlock failed … CredentialsProviderError — Token is expired`. `aws sso login` is a human
  lever

## .the shortcut refused

a hand-edit of the 13 snapshot lines would have turned CI green. **a snapshot is a capture by
definition; a hand-written one is a lie with a green checkmark** — and the prior review in this
ladder had just been caught with reconstructed output passed off as captured.

## .what landed

`getNormalizedPath(relativeFilePath).replace(/^\//, '')`, at the log site only. after a human ran
`aws sso login`:

| check | result |
| --- | --- |
| `../` in the acceptance snapshot | 0 |
| acceptance, local, env test | 24 passed, 0 failed |

⇒ the 6% doubt — that the repair would change more than those lines — is settled by the capture, not
by an argument.

## .the lesson

the seventh `dirty` grade to measure `clean`, and the best-evidenced one — a pasted tool failure, not
a ripple estimate. it was false within hours, and the row itself named the flip condition. **a block
is a measurement with an age**: a `dirty` grade whose cause is a credential carries a re-probe every
round, never a deferral.
