# rule.forbid.invented-output-dirs

> **this generator writes into exactly two directories. a third is forbidden.**

```
src/access/daos/
├── .generated/          # every shared artifact
│   ├── types.ts             (sql-code-generator)
│   ├── queryFunctions.ts    (sql-code-generator)
│   └── casts.ts             (this generator)
└── <x>Dao/              # every per-domain-object artifact
    ├── index.ts
    ├── castFromDatabaseObject.ts
    └── findById.ts · findByUuid.ts · findByUnique.ts · findByRef.ts · upsert.ts
```

a new **file** in either dir is ordinary work. a new **directory** is the violation.

## .why

- **the dot shields a consumer's generate run.** consumers point `sql-code-generator` at
  `src/access/daos/**/*.ts`, which negates only three filenames plus `*.test.ts`
  - a plain `.ts` anywhere under that tree is scanned for sql; one with none fails the run
  - a dot-prefixed dir is skipped by the glob
- **this generator never deletes.** `saveCode` is a `mkdir` plus one `writeFile` per path, so a
  dir abandoned in a later release leaves an orphan in every consumer's repo

## .why not a second shared dir
`.utils/` was invented for the modules that became `casts.ts`, on the argument that they are
utilities, not types. that grades the symbols; the dir names what the files are **for** —
`queryFunctions.ts` holds no single function, `types.ts` no single type.

| when… | then… |
|---|---|
| you would define a file into a dir not named above | put it in `.generated/` or `<x>Dao/` |
| you would group shared modules under a subject dir | they are files in `.generated/`; the dir is flat |
| you would rename `.generated/` | three kinds of site reference it — the definer that writes it, the definers that write an import of it, the cli banner. read `constants.ts` first |
| you would drop the dot for readability | the dot keeps the consumer's run green |

## .the test
> **is the file's dir `.generated/` or `<x>Dao/`?**

yes → ordinary work · no → pick one of the two.

## .the clamp
`defineDaoCodeFilesForDomainObjects.integration.test.ts` asserts every relpath against an allowlist
of shapes — a new file passes, a new directory fails by name (reintroduce `.utils/` and it reports
`Received Array [".utils/casts.ts"]`). a snapshot cannot catch this: `--updateSnapshot` absorbs a
new directory as a new entry, which is how `.utils/` shipped.

## .the boundary
governs the dao output root (`config.generates.daos.to`) only.

blocker: a generated dao file in a dir other than `.generated/` or `<x>Dao/` · a shared module in a
dir without a dot prefix · a `.generated/` rename that misses the generated imports or the banner.
false positive: a new file in either permitted dir.

⇒ see also: `constants.ts` · `term=generate._.choice._.md`.
