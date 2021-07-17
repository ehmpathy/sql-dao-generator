import { DomainEntity } from 'domain-objects';
import { Geocode } from './Geocode';

export enum TrainStatus {
  ASSEMBLED = 'ASSEMBLED',
  DISASSEMBLED = 'DISASSEMBLED',
}

export interface Train {
  id?: number;
  uuid?: string;
  homeStationGeocode: Geocode;
  combinationId: string; // a id which uniquely identifies a train by the combination of its components (e.g., a hash of locomotives + carriages)
  locomotiveUuids: string[]; // all of the locomotives used to power the train. may be one or more, in many configurations
  carriageUuids: string[]; // of all the carriages being moved in the train
  engineerUuids: string[]; // all of the engineers assigned to the train at the time
  status: TrainStatus;
}
export class Train extends DomainEntity<Train> implements Train {
  public static unique = ['combinationId'];
  public static updatable = ['engineers', 'status'];
}
