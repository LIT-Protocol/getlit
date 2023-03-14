import { getPackageVersion, greenLog } from '../utils.mjs';

/**
 * Prints out the help menu
 */
export function helpFunc({ commandMaps }) {
  // turn the map into an array of objects
  const commands = Array.from(commandMaps).map(([key, value]) => {
    return { key: value.usage, value: value.description, id: key };
  });

  // print the commands and align the descriptions based on the longest command
  const longestCommand = commands.reduce((acc, curr) => {
    return acc.length > curr.key.length ? acc : curr.key;
  }, '');

  console.log('longestCommand:', longestCommand);

  greenLog(
    `
🔥 GetLit CLI [v${getPackageVersion()}] - Powered by Lit Protocol 🔥

Usage: getlit [commands]

Commands:
`
  );

  const ignoreRepeat = ['default'];

  commands.forEach(({ key, value, id }) => {
    // ignore 'default' key
    if (ignoreRepeat.includes(id)) return;
    const spaces = ' '.repeat(longestCommand.length - key.length);
    greenLog(`  ${key}${spaces}   ${value}`);
  });

  console.log('\n');
  process.exit();
}
