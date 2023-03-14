#!/usr/bin/env node

import { exit } from 'process';
import { getArgs, readProjectJsonFile, redLog } from './utils.mjs';
import { docsFunc } from './scripts/docs.mjs';
import { helpFunc } from './scripts/help.mjs';
import { initFunc } from './scripts/init.mjs';

const args = getArgs();
globalThis.LIT_CONFIG = readProjectJsonFile('lit.config.json');

let COMMAND = args[0];

const commandMaps = new Map([
  [
    ['init', 'here'],
    {
      usage: 'getlit init [?project-name]',
      description: '🏗️  Initialise a new Lit project',
      fn: initFunc,
    },
  ],
  [
    ['docs', 'doc'],
    {
      usage: 'getlit docs',
      description: '📜 Open the Lit Protocol documentation',
      fn: docsFunc,
    },
  ],
  [
    ['help', 'default'],
    {
      usage: 'getlit help',
      description: '🆘 Show the help menu',
      fn: helpFunc,
    },
  ],
]);

const setup = () => {
  const findItem = (command) => {
    return [...commandMaps.entries()].find(([keys]) => keys.includes(command));
  };

  let item = findItem(COMMAND);

  if (item === undefined) {
    // find the similar command
    const similarCommand = [...commandMaps.keys()].find(([keys]) =>
      keys.includes(COMMAND)
    );

    console.log('similarCommand:', similarCommand);

    if (!similarCommand) {
      item = findItem('default');
    } else {
      const foundCommand = similarCommand[0];
      redLog(`Command not found. Did you mean "${foundCommand}"?`);
      exit();
    }
  }

  const _args = args.slice(1);

  try {
    item[1].fn({ commandMaps, args: _args });
  } catch (e) {
    // default
    item.fn({ commandMaps, args: _args });
  }
};

setup();
