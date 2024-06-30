# Changelog

## [0.8.0](https://github.com/ehmpathy/sql-dao-generator/compare/v0.7.4...v0.8.0) (2024-06-30)


### Features

* **hydrated:** dedupe query expressions in dao via hydrated view ([07e51e3](https://github.com/ehmpathy/sql-dao-generator/commit/07e51e35e2c7afaa0e3337c0574e1428d77eeaf1))

## [0.7.4](https://github.com/ehmpathy/sql-dao-generator/compare/v0.7.3...v0.7.4) (2024-06-17)


### Bug Fixes

* **query:** dereference nested array dobjs via view when needed ([202017c](https://github.com/ehmpathy/sql-dao-generator/commit/202017c353da754e3f1a3edcbc08a591a4ce44b0))

## [0.7.3](https://github.com/ehmpathy/sql-dao-generator/compare/v0.7.2...v0.7.3) (2024-06-15)


### Bug Fixes

* **alias:** correctly identify upsert varname based on alias in upsert derefs ([e3e6a3c](https://github.com/ehmpathy/sql-dao-generator/commit/e3e6a3cbdf142ac8acbffbbc112b2b787c1fce30))

## [0.7.2](https://github.com/ehmpathy/sql-dao-generator/compare/v0.7.1...v0.7.2) (2024-06-15)


### Bug Fixes

* **findby:** findByUnique with nested dobj should not require HasId ([2281436](https://github.com/ehmpathy/sql-dao-generator/commit/22814363d4e241e8a9a9252fa6702f3f33d4acbd))

## [0.7.1](https://github.com/ehmpathy/sql-dao-generator/compare/v0.7.0...v0.7.1) (2024-06-14)


### Bug Fixes

* **deps:** bump min sql-code-gen version to decrease errors ([c22f88b](https://github.com/ehmpathy/sql-dao-generator/commit/c22f88b9fc21c420b3f00d970f0b0e0983b5c12d))

## [0.7.0](https://github.com/ehmpathy/sql-dao-generator/compare/v0.6.0...v0.7.0) (2024-06-10)


### Features

* **alias:** support dobj alias for reference variable name ([faffacc](https://github.com/ehmpathy/sql-dao-generator/commit/faffacc73e5ce3276b35c74c809a78540ed10a9d))

## [0.6.0](https://github.com/ehmpathy/sql-dao-generator/compare/v0.5.3...v0.6.0) (2024-06-09)


### Features

* **context:** generate dao with separate context parameter per procedure pattern ([e1d97c6](https://github.com/ehmpathy/sql-dao-generator/commit/e1d97c62f417d9a3fa777b8daccb1d0fe08d12c8))

## [0.5.3](https://github.com/ehmpathy/sql-dao-generator/compare/v0.5.2...v0.5.3) (2024-06-09)


### Bug Fixes

* **dao:** handle nullable nested literals; prevent duplicate imports ([281b33f](https://github.com/ehmpathy/sql-dao-generator/commit/281b33ffd7e30731818ad6b451a9eac49a412785))

## [0.5.2](https://github.com/ehmpathy/sql-dao-generator/compare/v0.5.1...v0.5.2) (2024-06-09)


### Bug Fixes

* **control:** sync to updated join table name pattern to avoid postgres name len limits ([f841fdd](https://github.com/ehmpathy/sql-dao-generator/commit/f841fdd9b11dd88b5a0ba0fbc8bd8feb27543603))

## [0.5.1](https://github.com/ehmpathy/sql-dao-generator/compare/v0.5.0...v0.5.1) (2024-06-09)


### Bug Fixes

* **control:** reliably sort schema control declaration by dependency order ([286e62d](https://github.com/ehmpathy/sql-dao-generator/commit/286e62dcd2690a73b065ea796efbaf8e797b8ced))

## [0.5.0](https://github.com/ehmpathy/sql-dao-generator/compare/v0.4.2...v0.5.0) (2024-06-07)


### Features

* **alias:** alias dao suffix daoname with dao prefix for autocomplete++ ([48bef13](https://github.com/ehmpathy/sql-dao-generator/commit/48bef139d59765ba8e615cea427a8cf8ed9da4ad))

## [0.4.2](https://github.com/ehmpathy/sql-dao-generator/compare/v0.4.1...v0.4.2) (2024-06-07)


### Bug Fixes

* **refs:** unblock extract implicit refs in multi candidate suffix situations ([4aa9891](https://github.com/ehmpathy/sql-dao-generator/commit/4aa9891b4e9b9d49d2027fb35fad72a7900e89e7))

## [0.4.1](https://github.com/ehmpathy/sql-dao-generator/compare/v0.4.0...v0.4.1) (2024-05-26)


### Bug Fixes

* **debug:** explicitly log introspection errors ([b468f95](https://github.com/ehmpathy/sql-dao-generator/commit/b468f955e118a39226d4371e4560e6e77b2f68e7))

## [0.4.0](https://github.com/ehmpathy/sql-dao-generator/compare/v0.3.4...v0.4.0) (2024-05-26)


### Features

* **terms:** domain-value-object to domain-literal, for intuition++ ([#21](https://github.com/ehmpathy/sql-dao-generator/issues/21)) ([4b31074](https://github.com/ehmpathy/sql-dao-generator/commit/4b31074879eb8ba71e4fbad33a73539d40624348))


### Bug Fixes

* **practs:** upgrade to latest best ([#23](https://github.com/ehmpathy/sql-dao-generator/issues/23)) ([6e0875c](https://github.com/ehmpathy/sql-dao-generator/commit/6e0875c429a96a882854a1c55c877d471fc25f4e))

## [0.3.4](https://github.com/ehmpathy/sql-dao-generator/compare/v0.3.3...v0.3.4) (2023-08-05)


### Bug Fixes

* **deps:** lift out isPropertyNameAReferenceIntuitively method ([e183150](https://github.com/ehmpathy/sql-dao-generator/commit/e18315063693af0d5da53a691e75c3aa80d7e9d0))

## [0.3.3](https://github.com/ehmpathy/sql-dao-generator/compare/v0.3.2...v0.3.3) (2023-02-14)


### Bug Fixes

* **deps:** bump to sql-schema-generator version w/ config input ([5841b96](https://github.com/ehmpathy/sql-dao-generator/commit/5841b96c23441eb6f1900531d026018358c3cee8))

## [0.3.2](https://github.com/ehmpathy/sql-dao-generator/compare/v0.3.1...v0.3.2) (2023-02-12)


### Bug Fixes

* **refs:** dont import schema-generator reference to self ([d1f0f78](https://github.com/ehmpathy/sql-dao-generator/commit/d1f0f78273ff9e99eec418883d798e1cbd7a6ce3))

## [0.3.1](https://github.com/ehmpathy/sql-dao-generator/compare/v0.3.0...v0.3.1) (2023-02-12)


### Bug Fixes

* **deps:** bump sql-schema-control version to avoid tsnode dep missing error ([d5875f0](https://github.com/ehmpathy/sql-dao-generator/commit/d5875f0e0764672e6546287166131cc8fbedc582))
* **deps:** remove unused deps; upgrade sql-*-generator deps, bump best practices ([a461eb3](https://github.com/ehmpathy/sql-dao-generator/commit/a461eb3bec30df8d8f09f153211b2a651d84d248))
* **format:** apply prettier changes post bestpracts upgrade ([d81160f](https://github.com/ehmpathy/sql-dao-generator/commit/d81160fdebb0c9d1fc280d3ead0620a16261afc0))
* **gen:** ensure that generated code doesnt fail new stricter ts config ([91922c7](https://github.com/ehmpathy/sql-dao-generator/commit/91922c7b336a6562f76852d1d68f5425a8511ff6))
* **practs:** upgrade to declapract-typescript-ehmpathy best practices ([76a2926](https://github.com/ehmpathy/sql-dao-generator/commit/76a2926d5015934b96ad91726513c9b24759c779))
* **refs:** support self referencing domain objects ([c00f3e5](https://github.com/ehmpathy/sql-dao-generator/commit/c00f3e502845a5c598966159579d72004d905324))
* **tests:** resolve test synatx errors found while testing after upgrade ([2cbe936](https://github.com/ehmpathy/sql-dao-generator/commit/2cbe9360e9deafd8ccc4e0b5d0e20b1219ea4a66))
* **types:** resolve type errors after typescript upgrade ([13525c5](https://github.com/ehmpathy/sql-dao-generator/commit/13525c5e3c6f903c41a99b982e8c2d7dd6fae456))

## [0.3.0](https://www.github.com/uladkasach/sql-dao-generator/compare/v0.2.0...v0.3.0) (2022-01-03)


### Features

* **types:** upgrade type-fns and use HasMetadata to support asserting timestamps returned ([#6](https://www.github.com/uladkasach/sql-dao-generator/issues/6)) ([d21359b](https://www.github.com/uladkasach/sql-dao-generator/commit/d21359bdf47273a4d9845c540a8e014d6e3e8d80))
