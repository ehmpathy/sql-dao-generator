import shell from 'shelljs';
import { HasId, HasUuid } from 'simple-type-guards';
import { v4 } from 'uuid';
import { carriageDao } from '../__test_assets__/exampleProject/src/data/dao/carriageDao';
import { geocodeDao } from '../__test_assets__/exampleProject/src/data/dao/geocodeDao';
import { locomotiveDao } from '../__test_assets__/exampleProject/src/data/dao/locomotiveDao';
import { trainDao } from '../__test_assets__/exampleProject/src/data/dao/trainDao';
import { trainEngineerDao } from '../__test_assets__/exampleProject/src/data/dao/trainEngineerDao';
import {
  Carriage,
  CarriagePurpose,
  Geocode,
  Locomotive,
  LocomotiveFuel,
  Train,
  TrainEngineer,
  TrainStatus,
} from '../__test_assets__/exampleProject/src/domain';
import {
  getDatabaseConnection,
  DatabaseConnection,
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
      const queryResult = await dbConnection.query({ sql: 'select 1 as can_select' });
      expect(queryResult.rows[0].can_select).toEqual(1);
    });
    describe('geocodeDao', () => {
      it('it should be able to upsert', async () => {
        const geocode = new Geocode({
          latitude: 8,
          longitude: 21,
        });
        const upsertedGeocode = await geocodeDao.upsert({
          dbConnection,
          geocode,
        });
        // console.log(upsertedGeocode);
        expect(upsertedGeocode).toMatchObject(geocode);
        expect(upsertedGeocode).toHaveProperty('id', expect.any(Number));
      });
      it('should return the same new value object if the properties are equivalent', async () => {
        const geocodeA = await geocodeDao.upsert({
          dbConnection,
          geocode: new Geocode({
            latitude: 8,
            longitude: 21,
          }),
        });
        const geocodeB = await geocodeDao.upsert({
          dbConnection,
          geocode: new Geocode({
            latitude: 8,
            longitude: 21,
          }),
        });
        expect(geocodeB).toEqual(geocodeA); // should be the same exact one
      });
      it('should be able to find by id', async () => {
        const geocode = await geocodeDao.upsert({
          dbConnection,
          geocode: new Geocode({
            latitude: 8,
            longitude: 21,
          }),
        });
        const foundGeocode = await geocodeDao.findById({ dbConnection, id: geocode.id });
        expect(foundGeocode).toEqual(geocode); // should find the same one
      });
      it('should be able to find by unique', async () => {
        const geocode = await geocodeDao.upsert({
          dbConnection,
          geocode: new Geocode({
            latitude: 8,
            longitude: 21,
          }),
        });
        const foundGeocode = await geocodeDao.findByUnique({
          dbConnection,
          latitude: geocode.latitude,
          longitude: geocode.longitude,
        });
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
        const upsertedLocomotive = await locomotiveDao.upsert({
          dbConnection,
          locomotive,
        });
        // console.log(upsertedGeocode);
        expect(upsertedLocomotive).toMatchObject(locomotive);
        expect(upsertedLocomotive).toHaveProperty('id', expect.any(Number));
        expect(upsertedLocomotive).toHaveProperty('uuid', expect.any(String));
      });
      it('should return the same entity if the unique property is the same', async () => {
        const locomotive = await locomotiveDao.upsert({
          dbConnection,
          locomotive: new Locomotive({
            ein: 'l821',
            fuel: LocomotiveFuel.FISSION,
            capacity: 9001,
            milage: 1_700_000,
          }),
        });
        const locomotiveNow = await locomotiveDao.upsert({
          dbConnection,
          locomotive: new Locomotive({
            ...locomotive,
            milage: 1_900_000,
          }),
        });

        // check that its the same locomotive
        expect(locomotiveNow.id).toEqual(locomotive.id);
      });
      it('should be able to find by id', async () => {
        const locomotive = await locomotiveDao.upsert({
          dbConnection,
          locomotive: new Locomotive({
            ein: 'l821',
            fuel: LocomotiveFuel.FISSION,
            capacity: 9001,
            milage: 1_700_000,
          }),
        });
        const foundLocomotive = await locomotiveDao.findById({ dbConnection, id: locomotive.id });
        expect(foundLocomotive).toEqual(locomotive);
      });
      it('should be able to find by uuid', async () => {
        const locomotive = await locomotiveDao.upsert({
          dbConnection,
          locomotive: new Locomotive({
            ein: 'l821',
            fuel: LocomotiveFuel.FISSION,
            capacity: 9001,
            milage: 1_700_000,
          }),
        });
        const foundLocomotive = await locomotiveDao.findByUuid({ dbConnection, uuid: locomotive.uuid });
        expect(foundLocomotive).toEqual(locomotive);
      });
      it('should be able to find by unique', async () => {
        const locomotive = await locomotiveDao.upsert({
          dbConnection,
          locomotive: new Locomotive({
            ein: 'l821',
            fuel: LocomotiveFuel.FISSION,
            capacity: 9001,
            milage: 1_700_000,
          }),
        });
        const foundLocomotive = await locomotiveDao.findByUnique({ dbConnection, ein: locomotive.ein });
        expect(foundLocomotive).toEqual(locomotive);
      });
    });
    describe('trainDao', () => {
      let locomotive: HasId<HasUuid<Locomotive>>;
      let boosterCarriage: HasId<HasUuid<Carriage>>;
      let crewCarriage: HasId<HasUuid<Carriage>>;
      let leadEngineer: HasId<HasUuid<TrainEngineer>>;
      beforeAll(async () => {
        // upsert the composed entities
        locomotive = await locomotiveDao.upsert({
          dbConnection,
          locomotive: new Locomotive({
            ein: 'l821',
            fuel: LocomotiveFuel.FISSION,
            capacity: 9001,
            milage: 1_700_000,
          }),
        });
        boosterCarriage = await carriageDao.upsert({
          dbConnection,
          carriage: new Carriage({
            cin: 'booster-transport-1',
            carries: CarriagePurpose.FREIGHT,
            capacity: 9001,
          }),
        });
        crewCarriage = await carriageDao.upsert({
          dbConnection,
          carriage: new Carriage({
            cin: 'crew-transport-1',
            carries: CarriagePurpose.PASSENGER,
            capacity: 19,
          }),
        });
        leadEngineer = await trainEngineerDao.upsert({
          dbConnection,
          trainEngineer: new TrainEngineer({
            socialSecurityNumberHash: 'x13!y^a821kx(*12',
            name: 'Burt',
          }),
        });
      });
      it('should be able to upsert', async () => {
        // define the train
        const train = new Train({
          homeStationGeocode: new Geocode({ latitude: 7, longitude: 21 }),
          combinationId: `ice-launch-express-${v4()}`,
          locomotiveUuids: [locomotive.uuid],
          carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
          engineerUuids: [leadEngineer.uuid],
          leadEngineerUuid: leadEngineer.uuid,
          status: TrainStatus.ASSEMBLED,
        });

        // upsert it
        const upsertedTrain = await trainDao.upsert({ dbConnection, train });
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
        const train = await trainDao.upsert({
          dbConnection,
          train: new Train({
            homeStationGeocode: new Geocode({
              latitude: 7,
              longitude: 21,
            }),
            combinationId: `ice-launch-express-${v4()}`,
            locomotiveUuids: [locomotive.uuid],
            carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
            engineerUuids: [leadEngineer.uuid],
            leadEngineerUuid: leadEngineer.uuid,
            status: TrainStatus.ASSEMBLED,
          }),
        });

        // now find it
        const foundTrain = await trainDao.findById({ dbConnection, id: train.id });
        expect(foundTrain).toMatchObject(train);
      });
      it('should be able to find by uuid', async () => {
        // upsert it
        const train = await trainDao.upsert({
          dbConnection,
          train: new Train({
            homeStationGeocode: new Geocode({
              latitude: 7,
              longitude: 21,
            }),
            combinationId: `ice-launch-express-${v4()}`,
            locomotiveUuids: [locomotive.uuid],
            carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
            engineerUuids: [leadEngineer.uuid],
            leadEngineerUuid: leadEngineer.uuid,
            status: TrainStatus.ASSEMBLED,
          }),
        });

        // now find it
        const foundTrain = await trainDao.findByUuid({ dbConnection, uuid: train.uuid });
        expect(foundTrain).toMatchObject(train);
      });
      it('should be able to find by unique', async () => {
        // upsert it
        const train = await trainDao.upsert({
          dbConnection,
          train: new Train({
            homeStationGeocode: new Geocode({
              latitude: 7,
              longitude: 21,
            }),
            combinationId: `ice-launch-express-${v4()}`,
            locomotiveUuids: [locomotive.uuid],
            carriageUuids: [boosterCarriage.uuid, crewCarriage.uuid],
            engineerUuids: [leadEngineer.uuid],
            leadEngineerUuid: leadEngineer.uuid,
            status: TrainStatus.ASSEMBLED,
          }),
        });

        // now find it
        const foundTrain = await trainDao.findByUnique({ dbConnection, combinationId: train.combinationId });
        expect(foundTrain).toMatchObject(train);
      });
    });
  });
});
