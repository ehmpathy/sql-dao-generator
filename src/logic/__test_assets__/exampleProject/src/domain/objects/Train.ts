import { DomainEntity } from 'domain-objects';
import { Carriage } from './Carriage';
import { TrainEngineer } from './Engineer';
import { Locomotive } from './Locomotive';

export enum TrainStatus {
  ASSEMBLED = 'ASSEMBLED',
  DISASSEMBLED = 'DISASSEMBLED',
}

export interface Train {
  id?: number;
  uuid?: string;
  combinationId: string; // a id which uniquely identifies a train by the combination of its components (e.g., a hash of locomotives + carriages)
  locomotives: Locomotive[]; // all of the locomotives used to power the train. may be one or more, in many configurations
  carriages: Carriage[]; // of all the carriages being moved in the train
  engineers: TrainEngineer[]; // all of the engineers assigned to the train at the time
  status: TrainStatus;
}
export class Train extends DomainEntity<Train> implements Train {
  public static unique = ['combinationId'];
  public static updatable = ['engineers', 'status'];
}
