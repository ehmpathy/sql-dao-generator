import pg from 'pg';
import shell from 'shelljs';
import { given, then, useBeforeAll, when } from 'test-fns';
import type { HasMetadata } from 'type-fns';
import type { VisualogicContext } from 'visualogic';

import { uuid } from '@src/deps';
import { carriageDao } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/carriageDao';
import { geocodeDao } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/geocodeDao';
import { invoiceDao } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/invoiceDao';
import { locomotiveDao } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/locomotiveDao';
import { trainDao } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/trainDao';
import { trainEngineerDao } from '@src/domain.operations/.test.assets/exampleProject/src/access/daos/trainEngineerDao';
import { SvcPaymentsPaymentTransactionCurrency } from '@src/domain.operations/.test.assets/exampleProject/src/access/sdks/svcPayments';
import {
  Carriage,
  CarriagePurpose,
  Certificate,
  CertificateType,
  Geocode,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  Locomotive,
  LocomotiveFuel,
  Price,
  Train,
  TrainEngineer,
  TrainStatus,
} from '@src/domain.operations/.test.assets/exampleProject/src/domain';
import {
  type DatabaseConnection,
  getDatabaseConnection,
} from '@src/domain.operations/.test.assets/exampleProject/src/util/database/getDbConnection';
import { getDatabaseConnectionWithoutTypeParsers } from '@src/domain.operations/.test.assets/exampleProject/src/util/database/getDbConnectionWithoutTypeParsers';

jest.setTimeout(60 * 1000);

/**
 * note: many of the tests in this test suite depend on their predecessors
 *
 * e.g.,:
 * - apply schema depends on generate schema
 *    - which is actually tested in the unit test, because "generation" needs to be completed before the imports in _this_ file will even satisfy typescript type checking
 * - use daos depends on apply schema
 */
describe('generate', () => {
  describe('use the generated daos', () => {
    let dbConnection: DatabaseConnection;
    let context: { dbConnection: DatabaseConnection } & VisualogicContext;
    beforeAll(async () => {
      dbConnection = await getDatabaseConnection();
      context = {
        dbConnection,
        log: console,
      };
    });
    afterAll(async () => {
      await dbConnection.end();
    });
    it('should be able to apply the schema', async () => {
      // apply resources with schema control
      const applyResult = await shell.exec(
        `npx sql-schema-control apply -c ${__dirname}/../.test.assets/exampleProject/provision/schema/control.yml`,
      );

      // filter out node deprecation warnings from stderr (they're warnings, not errors)
      const stderrWithoutWarnings = applyResult.stderr
        .split('\n')
        .filter((line) => !line.includes('DeprecationWarning'))
        .filter((line) => !line.includes('--trace-deprecation'))
        .join('\n')
        .trim();
      if (stderrWithoutWarnings) throw new Error(stderrWithoutWarnings);
      // console.log(applyResult.stdout);
    });
    it('should be able to use the db connection', async () => {
      const queryResult = await dbConnection.query({
        sql: 'select 1 as can_select',
      });
      expect(queryResult.rows[0].can_select).toEqual(1);
    });
    describe('geocodeDao', () => {
      it('it should be able to upsert', async () => {
        const geocode = new Geocode({
          latitude: 8,
          longitude: 21,
        });
        const upsertedGeocode = await geocodeDao.upsert(
          {
            geocode,
          },
          context,
        );
        // console.log(upsertedGeocode);
        expect(upsertedGeocode).toMatchObject(geocode);
        expect(upsertedGeocode).toHaveProperty('id', expect.any(Number));
      });
      it('should return the same new literal if the properties are equivalent', async () => {
        const geocodeA = await geocodeDao.upsert(
          {
            geocode: new Geocode({
              latitude: 8,
              longitude: 21,
            }),
          },
          context,
        );
        const geocodeB = await geocodeDao.upsert(
          {
            geocode: new Geocode({
              latitude: 8,
              longitude: 21,
            }),
          },
          context,
        );
        expect(geocodeB).toEqual(geocodeA); // should be the same exact one
      });
      it('should be able to find by id', async () => {
        const geocode = await geocodeDao.upsert(
          {
            geocode: new Geocode({
              latitude: 8,
              longitude: 21,
            }),
          },
          context,
        );
        const foundGeocode = await geocodeDao.findById(
          {
            id: geocode.id,
          },
          context,
        );
        expect(foundGeocode).toEqual(geocode); // should find the same one
      });
      it('should be able to find by unique', async () => {
        const geocode = await geocodeDao.upsert(
          {
            geocode: new Geocode({
              latitude: 8,
              longitude: 21,
            }),
          },
          context,
        );
        const foundGeocode = await geocodeDao.findByUnique(
          {
            latitude: geocode.latitude,
            longitude: geocode.longitude,
          },
          context,
        );
        expect(foundGeocode).toEqual(geocode); // should find the same one
      });
    });
    describe('locomotiveDao', () => {
      it('it should be able to upsert', async () => {
        const locomotive = new Locomotive({
          ein: 'l821',
          fuel: LocomotiveFuel.FISSION,
          capacity: 9001,
          milage: 1_700_000,
        });
        const upsertedLocomotive = await locomotiveDao.upsert(
          {
            locomotive,
          },
          context,
        );
        // console.log(upsertedGeocode);
        expect(upsertedLocomotive).toMatchObject(locomotive);
        expect(upsertedLocomotive).toHaveProperty('id', expect.any(Number));
        expect(upsertedLocomotive).toHaveProperty('uuid', expect.any(String));
        expect(upsertedLocomotive).toHaveProperty(
          'createdAt',
          expect.any(Date),
        ); // should have the dates now, since these were autogenerated db values
        expect(upsertedLocomotive).toHaveProperty(
          'effectiveAt',
          expect.any(Date),
        );
        expect(upsertedLocomotive).toHaveProperty(
          'updatedAt',
          expect.any(Date),
        );
      });
      it('should return the same entity if the unique property is the same', async () => {
        const locomotive = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ein: 'l821',
              fuel: LocomotiveFuel.FISSION,
              capacity: 9001,
              milage: 1_700_000,
            }),
          },
          context,
        );
        const locomotiveNow = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ...locomotive,
              milage: 1_900_000,
            }),
          },
          context,
        );

        // check that its the same locomotive
        expect(locomotiveNow.id).toEqual(locomotive.id);
      });
      it('should be able to find by id', async () => {
        const locomotive = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ein: 'l821',
              fuel: LocomotiveFuel.FISSION,
              capacity: 9001,
              milage: 1_700_000,
            }),
          },
          context,
        );
        const foundLocomotive = await locomotiveDao.findById(
          {
            id: locomotive.id,
          },
          context,
        );
        expect(foundLocomotive).toMatchObject(locomotive);
      });
      it('should be able to find by uuid', async () => {
        const locomotive = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ein: 'l821',
              fuel: LocomotiveFuel.FISSION,
              capacity: 9001,
              milage: 1_700_000,
            }),
          },
          context,
        );
        const foundLocomotive = await locomotiveDao.findByUuid(
          {
            uuid: locomotive.uuid,
          },
          context,
        );
        expect(foundLocomotive).toMatchObject(locomotive);
      });
      it('should be able to find by unique', async () => {
        const locomotive = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ein: 'l821',
              fuel: LocomotiveFuel.FISSION,
              capacity: 9001,
              milage: 1_700_000,
            }),
          },
          context,
        );
        const foundLocomotive = await locomotiveDao.findByUnique(
          {
            ein: locomotive.ein,
          },
          context,
        );
        expect(foundLocomotive).toMatchObject(locomotive);
      });
    });
    describe('carriageDao', () => {
      it('it should be able to upsert', async () => {
        const carriage = new Carriage({
          cin: 'carriage-to-test',
          carries: CarriagePurpose.FREIGHT,
          capacity: 821,
        }) as HasMetadata<Carriage>;
        const upsertedCarriage = await carriageDao.upsert(
          {
            carriage,
          },
          context,
        );
        // console.log(upsertedGeocode);
        expect(upsertedCarriage).toMatchObject(carriage);
        expect(upsertedCarriage).toHaveProperty('id', expect.any(Number));
        expect(upsertedCarriage).toHaveProperty('uuid', expect.any(String));
      });
      it('should return the same entity if the unique property is the same', async () => {
        const carriage = await carriageDao.upsert(
          {
            carriage: new Carriage({
              uuid: uuid(),
              cin: 'carriage-to-test',
              carries: CarriagePurpose.FREIGHT,
              capacity: 821,
            }) as HasMetadata<Carriage>,
          },
          context,
        );
        const carriageNow = await carriageDao.upsert(
          {
            carriage: new Carriage({
              ...carriage,
              capacity: 721,
            }) as HasMetadata<Carriage>,
          },
          context,
        );

        // check that its the same locomotive
        expect(carriageNow.id).toEqual(carriage.id);
      });
      it('should be able to find by id', async () => {
        const carriage = await carriageDao.upsert(
          {
            carriage: new Carriage({
              uuid: uuid(),
              cin: 'carriage-to-test',
              carries: CarriagePurpose.FREIGHT,
              capacity: 821,
            }) as HasMetadata<Carriage>,
          },
          context,
        );
        const foundCarriage = await carriageDao.findById(
          {
            id: carriage.id,
          },
          context,
        );
        expect(foundCarriage).toEqual(carriage);
      });
      it('should be able to find by uuid', async () => {
        const carriage = await carriageDao.upsert(
          {
            carriage: new Carriage({
              uuid: uuid(),
              cin: 'carriage-to-test',
              carries: CarriagePurpose.FREIGHT,
              capacity: 821,
            }) as HasMetadata<Carriage>,
          },
          context,
        );
        const foundCarriage = await carriageDao.findByUuid(
          {
            uuid: carriage.uuid,
          },
          context,
        );
        expect(foundCarriage).toEqual(carriage);
      });
      it('should be able to find by unique', async () => {
        const carriage = await carriageDao.upsert(
          {
            carriage: new Carriage({
              uuid: uuid(),
              cin: 'carriage-to-test',
              carries: CarriagePurpose.FREIGHT,
              capacity: 821,
            }) as HasMetadata<Carriage>,
          },
          context,
        );
        const foundCarriage = await carriageDao.findByUnique(
          {
            cin: carriage.cin,
          },
          context,
        );
        expect(foundCarriage).toEqual(carriage);
      });
    });
    describe('trainDao', () => {
      let locomotive: HasMetadata<Locomotive>;
      let boosterCarriage: HasMetadata<Carriage>;
      let crewCarriage: HasMetadata<Carriage>;
      let leadEngineer: HasMetadata<TrainEngineer>;
      beforeAll(async () => {
        // upsert the composed entities
        locomotive = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ein: 'l821',
              fuel: LocomotiveFuel.FISSION,
              capacity: 9001,
              milage: 1_700_000,
            }),
          },
          context,
        );
        boosterCarriage = await carriageDao.upsert(
          {
            carriage: new Carriage({
              uuid: uuid(),
              cin: 'booster-transport-1',
              carries: CarriagePurpose.FREIGHT,
              capacity: 9001,
            }) as HasMetadata<Carriage>,
          },
          context,
        );
        crewCarriage = await carriageDao.upsert(
          {
            carriage: new Carriage({
              uuid: uuid(),
              cin: 'crew-transport-1',
              carries: CarriagePurpose.PASSENGER,
              capacity: 19,
            }) as HasMetadata<Carriage>,
          },
          context,
        );
        leadEngineer = await trainEngineerDao.upsert(
          {
            trainEngineer: new TrainEngineer({
              socialSecurityNumberHash: 'x13!y^a821kx(*12',
              certificates: [
                new Certificate({
                  type: CertificateType.LOCOMOTIVE_DRIVING,
                  industryId: 'super-train-driving-deluxe-experience',
                }),
              ],
              licenseUuids: [uuid()],
              name: 'Burt',
            }),
          },
          context,
        );
      });
      it('should be able to upsert', async () => {
        // define the train
        const train = new Train({
          homeStationGeocode: new Geocode({ latitude: 7, longitude: 21 }),
          combinationId: `ice-launch-express-${uuid()}`,
          locomotiveUuids: [locomotive.uuid],
          carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
          engineerUuids: [leadEngineer.uuid],
          leadEngineerUuid: leadEngineer.uuid,
          status: TrainStatus.ASSEMBLED,
        });

        // upsert it
        const upsertedTrain = await trainDao.upsert({ train }, context);
        expect(upsertedTrain).toMatchObject(train);
        expect(upsertedTrain).toHaveProperty('id', expect.any(Number));
        expect(upsertedTrain).toHaveProperty('uuid', expect.any(String));

        // now show that under the hood the implicit_uuid references are correctly stored, as foreign key references
        const result = await dbConnection.query({
          sql: 'select * from view_train_current where id = $1',
          values: [upsertedTrain.id],
        });
        expect(result.rows[0]).toMatchObject({
          home_station_geocode_id: expect.any(Number),
          locomotive_ids: [locomotive.id],
          carriage_ids: [boosterCarriage.id, crewCarriage.id],
          engineer_ids: [leadEngineer.id],
          lead_engineer_id: leadEngineer.id,
        });
      });
      it('should be able to find by id', async () => {
        // upsert it
        const train = await trainDao.upsert(
          {
            train: new Train({
              homeStationGeocode: new Geocode({
                latitude: 7,
                longitude: 21,
              }),
              combinationId: `ice-launch-express-${uuid()}`,
              locomotiveUuids: [locomotive.uuid],
              carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
              engineerUuids: [leadEngineer.uuid],
              leadEngineerUuid: leadEngineer.uuid,
              status: TrainStatus.ASSEMBLED,
            }),
          },
          context,
        );

        // now find it
        const foundTrain = await trainDao.findById(
          {
            id: train.id,
          },
          context,
        );
        expect(foundTrain).toMatchObject(train);
      });
      it('should be able to find by uuid', async () => {
        // upsert it
        const train = await trainDao.upsert(
          {
            train: new Train({
              homeStationGeocode: new Geocode({
                latitude: 7,
                longitude: 21,
              }),
              combinationId: `ice-launch-express-${uuid()}`,
              locomotiveUuids: [locomotive.uuid],
              carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
              engineerUuids: [leadEngineer.uuid],
              leadEngineerUuid: leadEngineer.uuid,
              status: TrainStatus.ASSEMBLED,
            }),
          },
          context,
        );

        // now find it
        const foundTrain = await trainDao.findByUuid(
          {
            uuid: train.uuid,
          },
          context,
        );
        expect(foundTrain).toMatchObject(train);
      });
      it('should be able to find by unique', async () => {
        // upsert it
        const train = await trainDao.upsert(
          {
            train: new Train({
              homeStationGeocode: new Geocode({
                latitude: 7,
                longitude: 21,
              }),
              combinationId: `ice-launch-express-${uuid()}`,
              locomotiveUuids: [locomotive.uuid],
              carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
              engineerUuids: [leadEngineer.uuid],
              leadEngineerUuid: leadEngineer.uuid,
              status: TrainStatus.ASSEMBLED,
            }),
          },
          context,
        );

        // now find it
        const foundTrain = await trainDao.findByUnique(
          {
            combinationId: train.combinationId,
          },
          context,
        );
        expect(foundTrain).toMatchObject(train);
      });

      /**
       * .what = reads one geocode row through BOTH serializations and compares the runtime values
       * .why  = only a live read proves the raw path and the `json_build_object` path converge on
       *         one runtime type once the generated cast applies
       * .note = Geocode is a literal, the only variant that can be nested and so reach the json path
       */
      given(
        '[case1] one geocode row, reachable through BOTH serializations',
        () => {
          when(
            '[t0] it is read through the generated daos, which apply the cast',
            () => {
              then(
                'the raw path and the json path return the SAME runtime types',
                async () => {
                  // upsert a train, which upserts its nested geocode as a literal
                  const train = await trainDao.upsert(
                    {
                      train: new Train({
                        homeStationGeocode: new Geocode({
                          latitude: 30.1234,
                          longitude: -97.5678,
                        }),
                        combinationId: `divergence-probe-${uuid()}`,
                        locomotiveUuids: [locomotive.uuid],
                        carriageUuids: [
                          boosterCarriage.uuid,
                          crewCarriage.uuid,
                        ],
                        engineerUuids: [leadEngineer.uuid],
                        leadEngineerUuid: leadEngineer.uuid,
                        status: TrainStatus.ASSEMBLED,
                      }),
                    },
                    context,
                  );

                  // read the geocode nested, via json_build_object. first, since `upsert` returns
                  // the nested literal as handed in, with no id
                  const trainFound = await trainDao.findById(
                    { id: train.id },
                    context,
                  );
                  if (!trainFound) throw new Error('train was not found by id');
                  const geocodeViaJson = trainFound.homeStationGeocode;

                  // read the same geocode raw: its own dao selects real columns
                  const geocodeViaRaw = await geocodeDao.findById(
                    { id: geocodeViaJson.id! },
                    context,
                  );
                  if (!geocodeViaRaw)
                    throw new Error('geocode was not found by id');

                  // both reads reached the same row
                  expect(geocodeViaJson.id).toEqual(geocodeViaRaw.id);

                  // date: a `Date` raw, an iso-8601 string from json
                  expect(geocodeViaRaw.createdAt).toBeInstanceOf(Date);
                  expect(geocodeViaJson.createdAt).toBeInstanceOf(Date);
                  expect(geocodeViaJson.createdAt!.getTime()).toEqual(
                    geocodeViaRaw.createdAt!.getTime(),
                  );

                  // number: `numeric` and `bigserial` arrive raw as strings, absent a type parser
                  expect(typeof geocodeViaRaw.id).toEqual('number');
                  expect(typeof geocodeViaJson.id).toEqual('number');
                  expect(typeof geocodeViaRaw.latitude).toEqual('number');
                  expect(typeof geocodeViaJson.latitude).toEqual('number');
                  expect(geocodeViaJson.latitude).toEqual(
                    geocodeViaRaw.latitude,
                  );
                  expect(geocodeViaJson.longitude).toEqual(
                    geocodeViaRaw.longitude,
                  );

                  // and the whole object agrees
                  expect(geocodeViaJson).toEqual(geocodeViaRaw);
                },
              );
            },
          );

          when(
            '[t1] it is read underneath the cast, straight off the wire',
            () => {
              then(
                'the two serializations still diverge — which is what the cast removes',
                async () => {
                  // .why = proves the [t0] convergence is the cast's work, since the wire diverges;
                  //        and pins the postgres contract that `json_build_object` renders a
                  //        `timestamptz` as iso-8601
                  const train = await trainDao.upsert(
                    {
                      train: new Train({
                        homeStationGeocode: new Geocode({
                          latitude: 41.4321,
                          longitude: -87.6543,
                        }),
                        combinationId: `wire-probe-${uuid()}`,
                        locomotiveUuids: [locomotive.uuid],
                        carriageUuids: [
                          boosterCarriage.uuid,
                          crewCarriage.uuid,
                        ],
                        engineerUuids: [leadEngineer.uuid],
                        leadEngineerUuid: leadEngineer.uuid,
                        status: TrainStatus.ASSEMBLED,
                      }),
                    },
                    context,
                  );

                  // read the nested blob straight off the view, with no cast between us and pg
                  const { rows: rowsNested } = await context.dbConnection.query(
                    {
                      sql: 'SELECT home_station_geocode FROM view_train_hydrated WHERE id = $1',
                      values: [train.id],
                    },
                  );
                  const blob = rowsNested[0]!.home_station_geocode;

                  // read the same row's raw columns, again with no cast
                  const { rows: rowsRaw } = await context.dbConnection.query({
                    sql: 'SELECT created_at, latitude, id FROM geocode WHERE id = $1',
                    values: [blob.id],
                  });
                  const raw = rowsRaw[0]!;

                  // date: json has no date type, so pg renders it as text
                  expect(typeof blob.created_at).toEqual('string');
                  expect(raw.created_at).toBeInstanceOf(Date);

                  // and the text is iso-8601 that `new Date` round-trips to the same instant
                  expect(new Date(blob.created_at).getTime()).toEqual(
                    raw.created_at.getTime(),
                  );

                  // number: a `numeric` crosses json as a number. the raw side depends on the parser
                  // this fixture installs, so only the json side is asserted
                  expect(typeof blob.latitude).toEqual('number');
                },
              );
            },
          );
        },
      );
    });

    describe('trainEngineerDao', () => {
      given('[case1] an engineer with an empty nested-literal array', () => {
        when('[t0] the zero-row aggregate is read', () => {
          then(
            'it reads back as [], never null, from the db and from the cast',
            async () => {
              // .why = the generated sql wraps each `json_agg` in `COALESCE(..., '[]'::json)`; the
              //        cast's unguarded `.map` and the non-null jsoned array type both rest on it.
              //        the raw-view read sits under the cast, so a cast cannot fake it
              const engineer = await trainEngineerDao.upsert(
                {
                  trainEngineer: new TrainEngineer({
                    socialSecurityNumberHash: `zero-row-probe-${uuid()}`,
                    certificates: [],
                    licenseUuids: [],
                    name: 'Uncertified Ursula',
                  }),
                },
                context,
              );

              // read the blob straight off the view, with no cast between us and pg
              const { rows } = await context.dbConnection.query({
                sql: 'SELECT certificates FROM view_train_engineer_hydrated WHERE id = $1',
                values: [engineer.id],
              });
              expect(rows[0]!.certificates).toEqual([]);
              expect(rows[0]!.certificates).not.toEqual(null);

              // and the cast, which calls `.map` with no null guard, survives it
              const found = await trainEngineerDao.findById(
                { id: engineer.id },
                context,
              );
              expect(found!.certificates).toEqual([]);

              // .teeth = the same aggregate without `COALESCE` returns `null`, so the assertions
              //          above measure the wrap, not a postgres default
              const { rows: rowsUnwrapped } = await context.dbConnection.query({
                sql: `
              SELECT (
                SELECT json_agg(json_build_object('id', certificate.id))
                FROM certificate
                JOIN unnest(train_engineer.certificate_ids) WITH ORDINALITY
                  AS certificate_ref (id, array_order_index)
                  ON certificate.id = certificate_ref.id
              ) AS certificates
              FROM view_train_engineer_current train_engineer
              WHERE train_engineer.id = $1
            `,
                values: [engineer.id],
              });
              expect(rowsUnwrapped[0]!.certificates).toEqual(null);
            },
          );
        });
      });
    });

    describe('invoiceDao', () => {
      it('should be able to upsert', async () => {
        // define the invoice
        const invoice = new Invoice({
          externalId: `cnc-machine:${uuid()}`,
          items: [
            new InvoiceLineItem({
              price: new Price({
                amount: 72100,
                currency: SvcPaymentsPaymentTransactionCurrency.USD,
              }),
              title: 'Open Source CNC Machine',
              explanation: 'This is an Open Source CNC Machine.',
            }),
            new InvoiceLineItem({
              price: new Price({
                amount: 8100,
                currency: SvcPaymentsPaymentTransactionCurrency.USD,
              }),
              title: 'Laser Cutter Adapter',
              explanation:
                'This is the Laser Cutting adapter for the Open Source CNC Machine.',
            }),
          ],
          totalPrice: new Price({
            amount: 72100 + 8100,
            currency: SvcPaymentsPaymentTransactionCurrency.USD,
          }),
          status: InvoiceStatus.PROPOSED,
        });

        // upsert it
        const upsertedInvoice = await invoiceDao.upsert(
          {
            invoice,
          },
          context,
        );
        expect(upsertedInvoice).toMatchObject(invoice);
        expect(upsertedInvoice).toHaveProperty('id', expect.any(Number));
        expect(upsertedInvoice).toHaveProperty('uuid', expect.any(String));
      });
      it('should be able to find by id', async () => {
        // upsert it
        const invoice = await invoiceDao.upsert(
          {
            invoice: new Invoice({
              externalId: `cnc-machine:${uuid()}`,
              items: [
                new InvoiceLineItem({
                  price: new Price({
                    amount: 72100,
                    currency: SvcPaymentsPaymentTransactionCurrency.USD,
                  }),
                  title: 'Open Source CNC Machine',
                  explanation: 'This is an Open Source CNC Machine.',
                }),
                new InvoiceLineItem({
                  price: new Price({
                    amount: 8100,
                    currency: SvcPaymentsPaymentTransactionCurrency.USD,
                  }),
                  title: 'Laser Cutter Adapter',
                  explanation:
                    'This is the Laser Cutting adapter for the Open Source CNC Machine.',
                }),
              ],
              totalPrice: new Price({
                amount: 72100 + 8100,
                currency: SvcPaymentsPaymentTransactionCurrency.USD,
              }),
              status: InvoiceStatus.PROPOSED,
            }),
          },
          context,
        );

        // now find it
        const foundInvoice = await invoiceDao.findById(
          {
            id: invoice.id,
          },
          context,
        );
        expect(foundInvoice).toMatchObject(invoice);
      });
      it('should be able to find by uuid', async () => {
        // upsert it
        const invoice = await invoiceDao.upsert(
          {
            invoice: new Invoice({
              externalId: `cnc-machine:${uuid()}`,
              items: [
                new InvoiceLineItem({
                  price: new Price({
                    amount: 72100,
                    currency: SvcPaymentsPaymentTransactionCurrency.USD,
                  }),
                  title: 'Open Source CNC Machine',
                  explanation: 'This is an Open Source CNC Machine.',
                }),
                new InvoiceLineItem({
                  price: new Price({
                    amount: 8100,
                    currency: SvcPaymentsPaymentTransactionCurrency.USD,
                  }),
                  title: 'Laser Cutter Adapter',
                  explanation:
                    'This is the Laser Cutting adapter for the Open Source CNC Machine.',
                }),
              ],
              totalPrice: new Price({
                amount: 72100 + 8100,
                currency: SvcPaymentsPaymentTransactionCurrency.USD,
              }),
              status: InvoiceStatus.PROPOSED,
            }),
          },
          context,
        );

        // now find it
        const foundInvoice = await invoiceDao.findByUuid(
          {
            uuid: invoice.uuid,
          },
          context,
        );
        expect(foundInvoice).toMatchObject(invoice);
      });
      it('should be able to find by unique', async () => {
        // upsert it
        const invoice = await invoiceDao.upsert(
          {
            invoice: new Invoice({
              externalId: `cnc-machine:${uuid()}`,
              items: [
                new InvoiceLineItem({
                  price: new Price({
                    amount: 72100,
                    currency: SvcPaymentsPaymentTransactionCurrency.USD,
                  }),
                  title: 'Open Source CNC Machine',
                  explanation: 'This is an Open Source CNC Machine.',
                }),
                new InvoiceLineItem({
                  price: new Price({
                    amount: 8100,
                    currency: SvcPaymentsPaymentTransactionCurrency.USD,
                  }),
                  title: 'Laser Cutter Adapter',
                  explanation:
                    'This is the Laser Cutting adapter for the Open Source CNC Machine.',
                }),
              ],
              totalPrice: new Price({
                amount: 72100 + 8100,
                currency: SvcPaymentsPaymentTransactionCurrency.USD,
              }),
              status: InvoiceStatus.PROPOSED,
            }),
          },
          context,
        );

        // now find it
        const foundInvoice = await invoiceDao.findByUnique(
          {
            externalId: invoice.externalId,
          },
          context,
        );
        expect(foundInvoice).toMatchObject(invoice);
      });
    });
  });

  /**
   * .what = the generated daos, read through a connection that installs no pg type parsers
   * .why  = proves the daos no longer depend on the consumer's own `setTypeParser` for oid 20/1700
   * .note = the fixture connection above already wrote to the process-global `pg.types`, so the
   *         pg default is restored for the duration, then handed back
   */
  given(
    '[case1] a consumer whose connection installs no pg type parsers',
    () => {
      const oidsToUnparse = [
        20, // int8 / bigint / bigserial
        1700, // numeric
      ];
      // .note = the originals live out here, not in the scene: a setup that throws after the swap
      //         leaves the scene unresolved, and the restore must still reach them
      const parserByOidBefore: Record<number, (value: string) => any> = {};
      // .note = the handle lives out here for the same reason; an unguarded `.end()` on an
      //         unresolved scene would mask the setup error with a TypeError
      const opened: { dbConnection: DatabaseConnection | null } = {
        dbConnection: null,
      };
      const scene = useBeforeAll(async () => {
        for (const oid of oidsToUnparse) {
          parserByOidBefore[oid] = pg.types.getTypeParser(oid);
          pg.types.setTypeParser(oid, (value: string) => value); // pg's own default for these two: hand back the text
        }
        const dbConnection = await getDatabaseConnectionWithoutTypeParsers();
        opened.dbConnection = dbConnection;
        return {
          dbConnection,
          context: { dbConnection, log: console } as {
            dbConnection: DatabaseConnection;
          } & VisualogicContext,
        };
      });
      afterAll(async () => {
        // restore only the oids that were captured
        for (const oid of oidsToUnparse)
          if (parserByOidBefore[oid])
            pg.types.setTypeParser(oid, parserByOidBefore[oid]!);

        // close only a connection that was opened
        if (opened.dbConnection) await opened.dbConnection.end();
      });

      when('[t0] a bare bigint and numeric are selected, under no cast', () => {
        then(
          'they arrive as strings — otherwise every claim below is vacuous',
          async () => {
            const { rows } = await scene.dbConnection.query({
              sql: 'SELECT 1::bigint AS a_bigint, 1.5::numeric AS a_numeric;',
            });
            expect(typeof rows[0].a_bigint).toEqual('string');
            expect(typeof rows[0].a_numeric).toEqual('string');
          },
        );
      });

      when('[t1] the generated daos are used over that connection', () => {
        then(
          'they still return the declared runtime types, from every generated query',
          async () => {
            // the upsert path reads db-generated values off its own select, a third site
            const upserted = await geocodeDao.upsert(
              { geocode: new Geocode({ latitude: 21, longitude: 8 }) },
              scene.context,
            );
            expect(typeof upserted.id).toEqual('number');
            expect(upserted.createdAt).toBeInstanceOf(Date);

            // the find path — a raw column select, through the generated cast
            const found = await geocodeDao.findById(
              { id: upserted.id },
              scene.context,
            );
            expect(typeof found!.id).toEqual('number');
            expect(typeof found!.latitude).toEqual('number');
            expect(found!.createdAt).toBeInstanceOf(Date);

            // and the two agree: one runtime type per column
            expect(found!.createdAt!.getTime()).toEqual(
              upserted.createdAt!.getTime(),
            );
            expect(found!.id).toEqual(upserted.id);
          },
        );
      });
    },
  );
});
