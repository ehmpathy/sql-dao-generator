# fulcrum F2: defer the declaration-ref unused-import derivation rather than fix it now

- caught = 2026-09-09
- rework = dirty → clean
- status = **reversed — fixed the same day**
- confidence = 92% at the defer

## .the fork

a `DIRECT_BY_DECLARATION` reference imported two symbols its cast never reads — the nested dao's
`castFromDatabaseObject` and its json-shape type. the cast body is `{ uuid: dbObject.<x>_uuid }`.

| option | cost |
| --- | --- |
| A. filter `nestedDomainObjectNames` on `reference.method === DIRECT_BY_NESTING` | ~8 lines, at-cause; moves the import list of every generated dao, so a full resnap |
| B. drop the symbol from the import only | narrower, and leaves the derivation wrong for the next consumer |
| C. defer, catch a dream ✅ | a consumer with `noUnusedLocals` inherits a red build from code they cannot edit |

**taken: C.** SAFE 🔴: a second writer was live in `defineDaoUtilCastMethodCodeForDomainObject.ts`,
and two edits had been refused as stale. CLEAN 🔴: a full-fixture resnap for a defect that predates
the route.

the 8% named the doubt: the second writer had likely left, so SAFE might no longer hold — and the
call was not re-tested after it cleared.

## .the reversal

option A shipped. a later fix gated the json shape on `domainObject.extends === DOMAIN_LITERAL`,
which removed the symbol the bad derivation named — so A became a prerequisite, or the generated code
would not compile. verified on the regenerated fixture: `carriageCargoDao` imports one type and no
nested cast.

⇒ the doubt the entry named before the reversal is the one that decided it.
