import * as migration_20261026_160149_initial from './20261026_160149_initial';
import * as migration_20261027_050913_cv from './20261027_050913_cv';
import * as migration_20261116_202207_paddle_price_id from './20261116_202207_paddle_price_id';
import * as migration_20261121_213134_licenses from './20261121_213134_licenses';
import * as migration_20261122_193024_sandbox_price_id from './20261122_193024_sandbox_price_id';

export const migrations = [
  {
    up: migration_20261026_160149_initial.up,
    down: migration_20261026_160149_initial.down,
    name: '20261026_160149_initial',
  },
  {
    up: migration_20261027_050913_cv.up,
    down: migration_20261027_050913_cv.down,
    name: '20261027_050913_cv',
  },
  {
    up: migration_20261116_202207_paddle_price_id.up,
    down: migration_20261116_202207_paddle_price_id.down,
    name: '20261116_202207_paddle_price_id',
  },
  {
    up: migration_20261121_213134_licenses.up,
    down: migration_20261121_213134_licenses.down,
    name: '20261121_213134_licenses',
  },
  {
    up: migration_20261122_193024_sandbox_price_id.up,
    down: migration_20261122_193024_sandbox_price_id.down,
    name: '20261122_193024_sandbox_price_id'
  },
];
