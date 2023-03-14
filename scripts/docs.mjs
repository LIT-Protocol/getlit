import open from 'open';
import { greenLog } from '../utils.mjs';

export function docsFunc() {
  const url = 'https://getlit.dev';
  greenLog(`We will open ${url} in your web browser.`);
  open(url);
  process.exit();
}
