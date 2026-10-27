import * as migration_20261026_160149_initial from './20261026_160149_initial';
import * as migration_20261027_050913_cv from './20261027_050913_cv';

export const migrations = [
  {
    up: migration_20261026_160149_initial.up,
    down: migration_20261026_160149_initial.down,
    name: '20261026_160149_initial',
  },
  {
    up: migration_20261027_050913_cv.up,
    down: migration_20261027_050913_cv.down,
    name: '20261027_050913_cv'
  },
];
