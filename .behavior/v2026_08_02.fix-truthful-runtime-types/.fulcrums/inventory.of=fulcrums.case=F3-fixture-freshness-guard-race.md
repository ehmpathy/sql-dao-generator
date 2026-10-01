# fulcrum F3: defer the fixture-freshness race rather than pick one of three redesigns

- caught = 2026-09-09
- rework = dirty → clean
- status = **reversed — fixed 2026-09-09**
- confidence = 85% at the defer

## .the fork, as understood at the defer

two freshness guards this route added compared the committed `.utils/` fixture against the definer's
output. `commands/generate.test.ts` writes that fixture, and the guards were believed to race it
across jest workers: reader-first grades the fixture, writer-first grades a file the same run wrote.

| option | cost |
| --- | --- |
| A. hoist the write to `globalSetup` | removes the race; the guard then verifies naught and should go |
| B. grade `git show HEAD:<path>` | the check actually wanted; unrunnable on an uncommitted tree |
| C. delete the guards | gives up a signal that caught real staleness that day |
| D. defer, catch a dream ✅ | the guarantee lapses; the fixture was fresh at the time |

the 15% named the bias: the drive authored the guards, so it leaned toward their retention.

## .the reversal — the diagnosis was wrong

peers r006 and r007 raised the guards independently, which forced a re-read of the mechanism:

| | the entry claimed | the npm scripts prove |
| --- | --- | --- |
| the guards | race the writer | they are integration tests, and `test:integration` runs the provision step `&&` jest — always writer-first |
| the defect | sometimes vacuous | **deterministically** vacuous — a definer's output compared to a file that same definer just wrote |

⇒ a check that cannot fail is `rule.forbid.failhide` outright. and the real race sat where the entry
never looked: `generate.test.ts` shared `jest.unit.config.ts` with unit suites that import the
generated files at module load — a writer and its readers, concurrent across workers.

## .what landed

- the guards: deleted. a vacuous check verifies naught, so no coverage is lost
- the race: `generate.test.ts` runs alone under `jest.provision.config.ts`, invoked with `&&` before
  both `test:unit` and `test:integration`
- the option the entry had refuted — move the writer out of the unit suite — was refuted on a true
  premise and a wrong conclusion: generation must precede the imports, but the writer need not sit
  inside a suite. a third process sequenced ahead of both satisfies the premise

## .the residual

a committed fixture can be stale in git while every run regenerates it. the honest mechanism is
regenerate + `git diff --exit-code` in CI. dream: `.dream/v2026_09_09.fix.freshness-guard-races-the-generate-test.md`.

## .the lesson

the SAFE/CLEAN test grades the **rework** and cannot catch a misdiagnosed **defect**. this entry ran
it correctly on a race that was not there, while the failhide that was there went unpriced. re-read
the mechanism, never only the remedy.
