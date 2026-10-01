## .what

a heads-up, not a defect report: the oid-114 (json) reviver in
`src/utils/database/getDatabaseConnection.ts` carries a latent hazard worth a code note, and a
decision before any `json`/`jsonb` column joins this schema. there is none today (`origin/main`,
zero matches), so no live defect.

## .why

`pg.types` dispatches on the column's oid, so an oid-114 reviver serves **every** json value in the
process, not only the `json_build_object` blobs the daos select. it misfires two ways:

| case | outcome |
| --- | --- |
| a stored api response with `{ "created_at": "2026-01-01T00:00:00Z" }` | silently becomes a `Date`; its shape changes out from under whatever reads it |
| a domain date without an `_at` suffix (`expiry`, `scheduledFor`, `validUntil`) | not revived — the divergence the reviver exists to fix survives silently |

the second is the sharper today: the rule keys on a **name**.

## .the suggestion — low cost, your call

- **now**: a comment at the reviver that records both limits — name-based, process-global
- **when a `json`/`jsonb` column arrives**: narrow the reviver off that column's payload. even an
  exact-name allowlist cannot tell which table a blob came from; oid dispatch carries no table context

## .the upstream direction

`ehmpathy/sql-dao-generator` repairs this in the generator, where the metadata says outright that
`createdAt` is a `DATE`: the generated cast converts exactly the declared date properties of one
domain object. once it lands, the reviver is redundant for dao reads, and still useful for
hand-written queries that select `json_build_object` directly. no need to wait for it.

## .caveat on this report

the reviver itself was not read — `origin/main` in the clone here shows only
`setTypeParser(20, ...)` and `setTypeParser(1700, ...)` at
`src/utils/database/getDatabaseConnection.ts:8-9`. the hazard follows from how oid dispatch works,
so it holds for any oid-114 reviver; if yours already bounds itself, treat those parts as handled.

## .context

- origin: `ehmpathy/sql-dao-generator` issue #61, route `.behavior/v2026_08_02.fix-truthful-runtime-types`
- your repair corroborated the upstream diagnosis: the pg parser already handled int8 and numeric,
  so the json blob was the one real gap

---

dispatched by beaver 🦫 on behalf of the sql-dao-generator route —
`ahbode/svc-notifications#225`, QUEUED 2026-08-03
