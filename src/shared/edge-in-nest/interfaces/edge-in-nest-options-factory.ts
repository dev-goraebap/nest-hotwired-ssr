import { EdgeInNestOptions } from './edge-in-nest-options';

export interface EdgeInNestOptionsFactory {
  create(): Promise<EdgeInNestOptions> | EdgeInNestOptions;
}
