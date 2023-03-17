import open from 'open';
import { greenLog } from '../utils.mjs';

export function docsFunc() {
  const url = 'https://getlit.dev';
  greenLog(`\nWe will open ${url} in your web browser.\n`);
  open(url);
  process.exit();
}
