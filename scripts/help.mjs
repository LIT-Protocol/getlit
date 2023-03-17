import { getPackageVersion, greenLog } from '../utils.mjs';

/**
 * Prints out the help menu
 */
export function helpFunc({ commandMaps }) {
  const commands = commandMaps.map((command) => {
    return {
      keys: [command.name, ...command.aliases],
      usage: command.usage,
      description: command.description,
      type: command.type,
      fn: command.fn,
    };
  });

  function getLongestUsageLength(commands) {
    let maxLength = 0;

    commands.forEach((command) => {
      const usageLength = command.usage.length;
      if (usageLength > maxLength) {
        maxLength = usageLength;
      }
    });

    return maxLength;
  }

  // print the commands and align the descriptions based on the longest command
  const longestCommand = getLongestUsageLength(commands);

  greenLog(
    `
🔥 GetLit CLI [v${getPackageVersion()}] - Powered by Lit Protocol 🔥

Usage: getlit [commands] | [] are optional, <> are required

Commands:
`
  );

  const ignoreRepeat = ['default'];
  const helpCommands = [];

  commands.forEach(({ usage, value, id, type, description }, i) => {
    // ignore 'default' usage
    if (ignoreRepeat.includes(id)) return;

    const spaces = ' '.repeat(longestCommand - usage.length);
    const str = `  ${usage}${spaces}   ${description}`;

    if (type === 'help') {
      helpCommands.push(str);
    } else {
      greenLog(str);
    }
  });

  if (helpCommands.length > 0) {
    greenLog(`\nHelp:\n`);
    helpCommands.forEach((str) => {
      greenLog(str);
    });
  }

  greenLog('\n');
  process.exit();
}