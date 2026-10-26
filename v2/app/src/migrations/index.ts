import * as migration_20261026_160149_initial from './20261026_160149_initial';

export const migrations = [
  {
    up: migration_20261026_160149_initial.up,
    down: migration_20261026_160149_initial.down,
    name: '20261026_160149_initial'
  },
];
