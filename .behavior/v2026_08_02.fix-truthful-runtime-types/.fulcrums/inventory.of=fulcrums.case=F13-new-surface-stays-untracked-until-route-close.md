# fulcrum F13: the new source surface stays untracked until the route closes

- caught = 2026-09-13, i024 as a mis-graded halt · re-raised i025 by `enroll-impl-behavior-intent` (r010)
- rework = clean — a `git add` plus one clamp, in one act
- status = ruled by the wisher
- confidence = n/a

## .the fork

the new generator sources, their tests, the generated fixture, and `jest.provision.config.ts` sat
untracked mid-drive. the reviewer's facts were correct: `exampleProject/.gitignore` states *every
generated dao file is tracked, because a fresh clone must typecheck*, and `test:unit` runs the
provision config unconditionally, so a fresh clone would fail before any test ran.

the dispute was only **when** to stage:

| call | the invariant holds |
| --- | --- |
| stage mid-drive | at every artifact hash |
| stage at route close ✅ | when the route ships — the only moment a fresh clone can exist |

## .the verdict

the wisher struck the halt: uncommitted work ships no artifact, so a fresh clone of `main` cannot fail
on files `main` does not carry. the invariant binds what is released. the instruction is durable —
the drive does not stage or commit on its own — so the move the reviewer asks for is not the drive's
to make.

the reviewer reads the worktree and cannot see that verdict, so it re-raises the gap every round,
correctly. this entry gives the re-raise a durable address.

## .what is still owed

a class-wide clamp: walk every `GeneratedCodeFile[]` relpath and assert it is git-tracked. it cannot
land before the stage — it would go red on the files it protects — so the two are one act.

- dream: `.dream/v2026_09_13.fix.no-clamp-proves-generated-utils-are-git-tracked.md`
- state 2026-09-27: the surface is now in the index (no untracked file under `src/` or
  `jest.provision.config.ts`); no clamp exists yet — zero `ls-files` calls under `src/`

## .where

- the retired halt: `blocker/5.1.execution.from_vision.case=git-index-misgrade.retired.md`
- the invariant: `src/domain.operations/.test.assets/exampleProject/.gitignore`
