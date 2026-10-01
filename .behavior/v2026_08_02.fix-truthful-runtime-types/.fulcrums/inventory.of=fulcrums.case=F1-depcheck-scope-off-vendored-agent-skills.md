# fulcrum F1: defer the `depcheck` path scope rather than edit `.depcheckrc.yml` now

- caught = 2026-09-09
- rework = dirty → clean
- status = **closed — option A shipped**
- confidence = 88% at the defer

## .the fork

`rhx git.repo.test --what lint` went red on three packages this repo does not depend on — `playwright`
and two declastruct packages — imported by vendored role skills under `.agent/repo=*/`, which are
symlinks into `node_modules`.

| option | cost |
| --- | --- |
| A. `ignore-patterns: [.agent]` | one line. was believed to give up the check on `.agent/repo=.this/` |
| B. a pattern that spares `repo=.this` | needs a grammar `.depcheckrc.yml` was not shown to support |
| C. defer, catch a dream ✅ | lint stays red locally; CI unaffected — `test-lint` never runs `prepare:rhachet`, so the symlinks do not exist there |

the dirt: A was graded a trade of a real check for a green light, and the file might be
declapract-managed, so a local edit might be reverted upstream.

## .what shipped

option A — `ignore-patterns: [.agent]` in `.depcheckrc.yml`, scoped by path rather than by package
name, so the next role bump that ships a new import does not re-redden it.

## .what the defer got wrong

`.agent/repo=.this/` holds only markdown — briefs and a readme, zero source files. so A gave up no
check at all; the cost that made it dirty did not exist. one `git ls-files` settles it.

the declapract half is unverified: if `.depcheckrc.yml` is declapract-managed, the next upgrade may
revert the line, and the durable home is `declapract-typescript-ehmpathy`.
