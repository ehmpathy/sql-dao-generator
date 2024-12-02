import shell from 'shelljs';
import { HasMetadata } from 'type-fns';

import { uuid } from '../../deps';
import { SvcPaymentsPaymentTransactionCurrency } from '../__test_assets__/exampleProject/src/data/clients/svcPayments';
// @ts-ignore
import { carriageDao } from '../__test_assets__/exampleProject/src/data/dao/carriageDao';
// @ts-ignore
import { geocodeDao } from '../__test_assets__/exampleProject/src/data/dao/geocodeDao';
// @ts-ignore
import { invoiceDao } from '../__test_assets__/exampleProject/src/data/dao/invoiceDao';
// @ts-ignore
import { locomotiveDao } from '../__test_assets__/exampleProject/src/data/dao/locomotiveDao';
// @ts-ignore
import { trainDao } from '../__test_assets__/exampleProject/src/data/dao/trainDao';
// @ts-ignore
import { trainEngineerDao } from '../__test_assets__/exampleProject/src/data/dao/trainEngineerDao';
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
} from '../__test_assets__/exampleProject/src/domain';
import {
  DatabaseConnection,
  getDatabaseConnection,
} from '../__test_assets__/exampleProject/src/util/database/getDbConnection';

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
    beforeAll(async () => {
      dbConnection = await getDatabaseConnection();
    });
    afterAll(async () => {
      await dbConnection.end();
    });
    it('should be able to apply the schema', async () => {
      // apply resources with schema control
      const applyResult = await shell.exec(
        `npx sql-schema-control apply -c ${__dirname}/../__test_assets__/exampleProject/provision/schema/control.yml`,
      );
      if (applyResult.stderr) throw new Error(applyResult.stderr);
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
          { dbConnection },
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
          { dbConnection },
        );
        const geocodeB = await geocodeDao.upsert(
          {
            geocode: new Geocode({
              latitude: 8,
              longitude: 21,
            }),
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundGeocode = await geocodeDao.findById(
          {
            id: geocode.id,
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundGeocode = await geocodeDao.findByUnique(
          {
            latitude: geocode.latitude,
            longitude: geocode.longitude,
          },
          { dbConnection },
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
          { dbConnection },
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
          { dbConnection },
        );
        const locomotiveNow = await locomotiveDao.upsert(
          {
            locomotive: new Locomotive({
              ...locomotive,
              milage: 1_900_000,
            }),
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundLocomotive = await locomotiveDao.findById(
          {
            id: locomotive.id,
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundLocomotive = await locomotiveDao.findByUuid(
          {
            uuid: locomotive.uuid,
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundLocomotive = await locomotiveDao.findByUnique(
          {
            ein: locomotive.ein,
          },
          { dbConnection },
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
          { dbConnection },
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
          { dbConnection },
        );
        const carriageNow = await carriageDao.upsert(
          {
            carriage: new Carriage({
              ...carriage,
              capacity: 721,
            }) as HasMetadata<Carriage>,
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundCarriage = await carriageDao.findById(
          {
            id: carriage.id,
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundCarriage = await carriageDao.findByUuid(
          {
            uuid: carriage.uuid,
          },
          { dbConnection },
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
          { dbConnection },
        );
        const foundCarriage = await carriageDao.findByUnique(
          {
            cin: carriage.cin,
          },
          { dbConnection },
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
          { dbConnection },
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
          { dbConnection },
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
          { dbConnection },
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
          { dbConnection },
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
        const upsertedTrain = await trainDao.upsert(
          { train },
          { dbConnection },
        );
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
          { dbConnection },
        );

        // now find it
        const foundTrain = await trainDao.findById(
          {
            id: train.id,
          },
          { dbConnection },
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
          { dbConnection },
        );

        // now find it
        const foundTrain = await trainDao.findByUuid(
          {
            uuid: train.uuid,
          },
          { dbConnection },
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
          { dbConnection },
        );

        // now find it
        const foundTrain = await trainDao.findByUnique(
          {
            combinationId: train.combinationId,
          },
          { dbConnection },
        );
        expect(foundTrain).toMatchObject(train);
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
          { dbConnection },
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
          { dbConnection },
        );

        // now find it
        const foundInvoice = await invoiceDao.findById(
          {
            id: invoice.id,
          },
          { dbConnection },
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
          { dbConnection },
        );

        // now find it
        const foundInvoice = await invoiceDao.findByUuid(
          {
            uuid: invoice.uuid,
          },
          { dbConnection },
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
          { dbConnection },
        );

        // now find it
        const foundInvoice = await invoiceDao.findByUnique(
          {
            externalId: invoice.externalId,
          },
          { dbConnection },
        );
        expect(foundInvoice).toMatchObject(invoice);
      });
    });
  });
});
