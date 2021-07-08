import { Geocode } from './Geocode';
import { TrainLocatedEvent } from './TrainLocatedEvent';

describe('TrainLocatedEvent', () => {
  it('should be able to instantiate', () => {
    const event = new TrainLocatedEvent({
      trainUuid: '__UUID__',
      occurredAt: new Date().toISOString(),
      geocode: new Geocode({ latitude: 81, longitude: 18 }),
    });
    expect(event.trainUuid).toEqual('__UUID__'); // sanity check
  });
});
